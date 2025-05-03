import {NextRequest, NextResponse} from "next/server";

import {getLocations} from "@/lib/dincy";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");

  if (secret !== process.env.SECRET) {
    return NextResponse.json({error: "Invalid secret"}, {status: 401});
  }

  const locations = await getLocations();

  const data = await fetch(
    `https://discord.com/api/v10/applications/${process.env.APPLICATION_ID!}/guilds/${process.env.DISCORD_GUILD_ID!}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          name: "reserva",
          description: "Muestra las canchas disponibles",
          type: 1,
          options: [
            {
              name: "lugar",
              description: "Selecciona el lugar",
              type: 3,
              required: true,
              choices: locations.map((location) => ({
                name: location.name,
                value: location.id,
              })),
            },
            {
              name: "fecha",
              description: "Fecha de la reserva (YYYY-MM-DD)",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "equipos",
          description: "Arma equipos balanceados basado en la lista de convocados",
          type: 1,
          options: [
            {
              name: "mensaje",
              description: "ID del mensaje con la lista de convocados",
              type: 3,
              required: true,
            },
            {
              name: "equipos",
              description: "Número de equipos a formar",
              type: 3,
              required: true,
              min_value: 2,
            },
          ],
        },
      ]),
    },
  ).then((res) => res.json());

  return NextResponse.json(data);
}
