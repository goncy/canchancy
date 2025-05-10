"use server";

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

function balanceTeamsGreedy(roster: Player[], teamsCount: number): Player[][] {
  // Sort players by average skill in descending order
  const sortedPlayers = [...roster].sort((a, b) => b.average - a.average);

  // Initialize teams and their total scores
  const teams: Player[][] = Array(teamsCount)
    .fill([])
    .map(() => []);
  const teamSums = Array(teamsCount).fill(0);

  // For each player, try assigning them to each team and pick the best result
  sortedPlayers.forEach((player) => {
    let bestDiff = Infinity;
    let bestTeamIndex = 0;

    // Try assigning the player to each team
    for (let teamIndex = 0; teamIndex < teamsCount; teamIndex++) {
      // Create temporary arrays to simulate the assignment
      const tempTeamSums = [...teamSums];

      tempTeamSums[teamIndex] += player.average;

      // Calculate the maximum difference between any two teams
      const maxDiff = Math.max(...tempTeamSums) - Math.min(...tempTeamSums);

      // If this assignment results in better balance, keep it
      if (maxDiff < bestDiff) {
        bestDiff = maxDiff;
        bestTeamIndex = teamIndex;
      }
    }

    // Assign player to the best team
    teams[bestTeamIndex].push(player);
    teamSums[bestTeamIndex] += player.average;
  });

  return teams;
}

function balanceTeamsBruteForce(roster: Player[], teamsCount: number): Player[][] {
  let bestDiff = Infinity;
  let bestTeams: Player[][] = Array(teamsCount)
    .fill([])
    .map(() => []);

  // Generate all possible combinations of players for the first team
  const generateCombinations = (players: Player[], size: number): Player[][] => {
    if (size === 0) return [[]];
    if (players.length === 0) return [];

    const [first, ...rest] = players;
    const withFirst = generateCombinations(rest, size - 1).map((combo) => [first, ...combo]);
    const withoutFirst = generateCombinations(rest, size);

    return [...withFirst, ...withoutFirst];
  };

  // Try all possible team sizes for the first team
  for (let teamSize = 0; teamSize <= roster.length; teamSize++) {
    const teamCombinations = generateCombinations(roster, teamSize);

    for (const firstTeam of teamCombinations) {
      const remainingPlayers = roster.filter((player) => !firstTeam.includes(player));

      // Recursively balance remaining players into remaining teams
      const remainingTeams =
        teamsCount === 1 ? [] : balanceTeamsBruteForce(remainingPlayers, teamsCount - 1);

      const allTeams = [firstTeam, ...remainingTeams];
      const teamSums = allTeams.map((team) =>
        team.reduce((sum, player) => sum + player.average, 0),
      );
      const maxDiff = Math.max(...teamSums) - Math.min(...teamSums);

      if (maxDiff < bestDiff) {
        bestDiff = maxDiff;
        bestTeams = allTeams;
      }
    }
  }

  return bestTeams;
}

export async function getTeamsFromMessage(message: string, teamsCount: number) {
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
    .map((player) =>
      player
        .replace(/^[\d.\s-]+/, "")
        .replace(/\s*⚠$/, "")
        .trim(),
    )
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

  // Calculate the number of permutations
  const permutationCount = Math.pow(teamsCount, roster.length);

  // Choose algorithm based on roster size and number of teams
  if (permutationCount < 1_500_000) {
    return balanceTeamsBruteForce(roster, teamsCount);
  } else {
    return balanceTeamsGreedy(roster, teamsCount);
  }
}
