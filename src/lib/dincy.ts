import {unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag} from "next/cache";

type Player = {
  name: string;
  alias: string[];
  speed: number;
  resistance: number;
  technical: number;
  average: number;
};

type Location = {
  id: string;
  name: string;
};

function cleanName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim()
    .toLowerCase();
}

export async function getPlayers() {
  "use cache";

  cacheLife("max");
  cacheTag("players");

  // Fetch raw TSV data from Google Sheets
  const tsv = await fetch(process.env.PLAYERS_TSV!).then((res) => res.text());

  // Parse TSV rows into Player objects, skipping the header row
  return tsv
    .split("\n")
    .slice(1)
    .map((row) => {
      const [names, speed, resistance, technical, average] = row.split("\t");
      const [name, ...alias] = names.split(",");

      return {
        name: name.trim(),
        alias: alias.map((alias) => alias.trim()),
        speed: parseInt(speed),
        resistance: parseInt(resistance),
        technical: parseInt(technical),
        average: parseInt(average),
      };
    }) as Player[];
}

export async function getLocations() {
  "use cache";

  cacheLife("max");
  cacheTag("locations");

  // Fetch raw TSV data from Google Sheets
  const tsv = await fetch(process.env.LOCATIONS_TSV!).then((res) => res.text());

  // Parse TSV rows into Court objects, skipping the header row
  return tsv
    .split("\n")
    .slice(1)
    .map((row) => {
      const [id, name] = row.split("\t");

      return {
        id: id.trim(),
        name: name.trim(),
      };
    }) as Location[];
}

export async function getTeamsFromMessage(message: string) {
  const players = await getPlayers();
  let names: string[] = [];

  if (message.includes("**Lista de Espera de Confirmación:**")) {
    names = message.split("**Lista de Espera de Confirmación:**\n")[1].split("\n\n")[0].split("\n");
  } else if (message.includes(",")) {
    names = message.split(",");
  } else {
    names = message.split("\n");
  }

  names = names
    .map((player) => player.trim())
    .map((player) => player.replace(/^[\d.\s-]+/, "").trim())
    .filter((player) => player !== "");

  const roster = names.map((name) => {
    // Get the player based on its name or alias
    const player = players.find((player) =>
      [player.name, ...player.alias].some((alias) => cleanName(alias) === cleanName(name)),
    );

    return (
      player || {
        name: `${name} ⚠`,
        speed: 7,
        resistance: 7,
        technical: 7,
        average: 7,
        alias: [name],
      }
    );
  });

  let bestDiff = Infinity;
  let teams: [Player[], Player[]] = [[], []];

  // Try all possible team combinations using bit manipulation
  for (let i = 0; i < 1 << roster.length; i++) {
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    let sumA = 0;
    let sumB = 0;

    // Assign players to teams based on binary representation
    for (let j = 0; j < roster.length; j++) {
      if ((i & (1 << j)) !== 0) {
        teamA.push(roster[j]);
        sumA += roster[j].average;
      } else {
        teamB.push(roster[j]);
        sumB += roster[j].average;
      }
    }

    const diff = Math.abs(sumA - sumB);

    // Update teams if current split is better balanced
    if (
      diff < bestDiff ||
      (diff === bestDiff &&
        Math.abs(teamA.length - teamB.length) < Math.abs(teams[0].length - teams[1].length))
    ) {
      bestDiff = diff;
      teams = [teamA, teamB];
    }
  }

  return teams;
}
