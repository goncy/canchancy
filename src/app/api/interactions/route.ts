import {NextResponse} from "next/server";
import {after} from "next/server";

import {getMessage, verifyRequest, sendInteractionFollowupMessage} from "@/lib/discord";
import {getCourts} from "@/lib/atc";
import {getTeamsFromMessage} from "@/lib/dincy";

export async function POST(request: Request) {
  const interaction = await verifyRequest(request);

  // Handle ping
  if (interaction.type === 1) {
    return NextResponse.json({type: 1});
  }

  // Handle command
  if (interaction.type === 2) {
    switch (interaction.data?.name) {
      case "reserva": {
        const [court, date] = interaction.data.options!;

        const courts = await getCourts(court.value as string, date.value as string);

        return NextResponse.json({
          type: 4,
          data: {
            content: `Las canchas disponibles para **${courts.name}** el **${date.value}** son:\n${courts.courts.map((court) => `- **${court.name}**: ${court.slots.join(", ")}`).join("\n")}`,
          },
        });
      }

      case "equipos": {
        const [messageId, teamsCount] = interaction.data.options!;

        // Use after to process teams generation after responding
        after(async () => {
          try {
            const message = await getMessage(messageId.value as string, interaction.channel_id!);
            const teams = await getTeamsFromMessage(
              message.content,
              teamsCount?.value ? Number(teamsCount.value) : 2,
            );

            const teamsMessage = teams
              .map((team, index) => {
                const teamList = team.map((player) => `• ${player.name}`).join("\n");

                return index === teams.length - 1 ? teamList : `${teamList}\n\n**VS**\n\n`;
              })
              .join("");

            await sendInteractionFollowupMessage(interaction, teamsMessage);
          } catch (error) {
            console.error("Error processing teams:", error);

            try {
              await sendInteractionFollowupMessage(
                interaction,
                "❌ Ocurrió un error al generar los equipos. Por favor, asegurate de que el mensaje exista en este canal e intenta nuevamente.",
              );
            } catch (followupError) {
              console.error("Failed to send error message to Discord:", followupError);
            }
          }
        });

        // Immediately respond with deferred response to avoid timeout
        return NextResponse.json({
          type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
        });
      }

      default:
        return new Response("Unknown command", {status: 400});
    }
  }

  // Handle unknown type
  return new Response("Unknown interaction type", {status: 400});
}
