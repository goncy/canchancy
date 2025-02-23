import {NextResponse} from "next/server";

import {verifyRequest} from "@/lib/discord";
import {getCourtsData} from "@/lib/atc";

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

        const fieldData = await getCourtsData(court.value as string, date.value as string);

        return NextResponse.json({
          type: 4,
          data: {
            content: `Las canchas disponibles para **${fieldData.name}** el **${date.value}** son:\n${fieldData.courts.map((court) => `- **${court.name}**: ${court.slots.join(", ")}`).join("\n")}`,
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
