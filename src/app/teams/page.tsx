import {getTeamsFromMessage} from "@/lib/dincy";
import {getMessage} from "@/lib/discord";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{messageId: string; channelId: string}>;
}) {
  const {messageId, channelId} = await searchParams;
  const message = await getMessage(messageId, channelId);
  const [teamA, teamB] = await getTeamsFromMessage(message.content);

  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Team A</h1>
        <ul>
          {teamA.map((player) => (
            <li key={player.name}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Team B</h1>
        <ul>
          {teamB.map((player) => (
            <li key={player.name}>{player.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
