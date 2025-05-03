import {NextResponse} from "next/server";

import {getMessage, verifyRequest} from "@/lib/discord";
import {getCourts} from "@/lib/atc";
import {getTeamsFromMessage} from "@/lib/dincy";

export async function POST(request: Request) {
  const body = await verifyRequest(request);

  // Handle ping
  if (body.type === 1) {
    return NextResponse.json({type: 1});
  }

  // Handle command
  if (body.type === 2) {
    switch (body.data?.name) {
      case "reserva": {
        const [court, date] = body.data.options!;

        const courts = await getCourts(court.value as string, date.value as string);

        return NextResponse.json({
          type: 4,
          data: {
            content: `Las canchas disponibles para **${courts.name}** el **${date.value}** son:\n${courts.courts.map((court) => `- **${court.name}**: ${court.slots.join(", ")}`).join("\n")}`,
          },
        });
      }

      case "equipos": {
        const [messageId, teamsCount] = body.data.options!;

        const message = await getMessage(messageId.value as string, body.channel_id);
        const teams = await getTeamsFromMessage(message.content, teamsCount?.value as number);

        return NextResponse.json({
          type: 4,
          data: {
            content: teams
              .map((team, index) => {
                const teamList = team.map((player) => `• ${player.name}`).join("\n");

                return index === teams.length - 1 ? teamList : `${teamList}\n\n**VS**\n\n`;
              })
              .join(""),
          },
        });
      }

      default:
        return new Response("Unknown command", {status: 400});
    }
  }

  // Handle unknown type
  return new Response("Unknown interaction type", {status: 400});
}
