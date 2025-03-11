import {unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag} from "next/cache";

type Player = {
  name: string;
  speed: number;
  resistance: number;
  technical: number;
  average: number;
};

type Location = {
  id: string;
  name: string;
};

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
      const [name, speed, resistance, technical, average] = row.split("\t");

      return {
        name: name.trim(),
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
  "use cache";

  cacheLife("max");
  cacheTag("teams");

  const players = await getPlayers();
  const names = message
    .split("Lista de Espera de Confirmación:\n")[1]
    .split("\n\n")[0]
    .split("\n")
    .map((player) => player.trim());

  const roster = names.map((name) => {
    const player = players.find(
      (player) => player.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

    return player || {name: `${name} ⚠`, speed: 7, resistance: 7, technical: 7, average: 7};
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
