"use client";

import {useState} from "react";

import {getTeamsFromMessage} from "@/lib/dincy";
import {getMessage} from "@/lib/discord";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

type Team = {
  name: string;
  speed: number;
  resistance: number;
  technical: number;
  average: number;
  alias: string[];
};

interface TeamsFormProps {
  initialMessageId?: string;
  initialChannelId?: string;
  initialTeamsCount?: string;
}

export function TeamsForm({initialMessageId, initialChannelId, initialTeamsCount}: TeamsFormProps) {
  const [messageId, setMessageId] = useState(initialMessageId || "");
  const [channelId, setChannelId] = useState(initialChannelId || "");
  const [teamsCount, setTeamsCount] = useState(initialTeamsCount || "2");
  const [teams, setTeams] = useState<Team[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const message = await getMessage(messageId, channelId);
      const generatedTeams = await getTeamsFromMessage(message.content, parseInt(teamsCount));

      setTeams(generatedTeams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium" htmlFor="messageId">
            Message ID
          </label>
          <Input
            required
            id="messageId"
            type="text"
            value={messageId}
            onChange={(e) => setMessageId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="channelId">
            Channel ID
          </label>
          <Input
            required
            id="channelId"
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="teamsCount">
            Number of Teams
          </label>
          <Input
            required
            id="teamsCount"
            min="2"
            type="number"
            value={teamsCount}
            onChange={(e) => setTeamsCount(e.target.value)}
          />
        </div>

        <Button disabled={loading} type="submit">
          {loading ? "Generating Teams..." : "Generate Teams"}
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {teams.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {teams.map((team, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-lg border p-4">
              <h2 className="text-xl font-bold">Team {String.fromCharCode(65 + index)}</h2>
              <ul className="space-y-1">
                {team.map((player) => (
                  <li key={player.name}>{player.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
