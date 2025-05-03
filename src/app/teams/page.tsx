import {TeamsForm} from "./teams-form";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{messageId?: string; channelId?: string; teamsCount?: string}>;
}) {
  const {messageId, channelId, teamsCount} = await searchParams;

  return (
    <section className="container mx-auto p-4">
      <TeamsForm
        initialChannelId={channelId}
        initialMessageId={messageId}
        initialTeamsCount={teamsCount}
      />
    </section>
  );
}
