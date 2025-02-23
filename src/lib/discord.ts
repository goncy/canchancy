import {NextResponse} from "next/server";
import nacl from "tweetnacl";

type DiscordInteraction = {
  type: number; // 1 = PING, 2 = APPLICATION_COMMAND, etc.
  id: string; // ID de la interacción
  application_id: string; // ID de la aplicación (bot)
  guild_id?: string; // Opcional, solo si el comando se ejecuta en un servidor
  channel_id?: string; // Opcional, si el comando se ejecuta en un canal
  member?: {
    user: {
      id: string;
      username: string;
      discriminator: string;
      avatar?: string;
    };
    roles: string[];
    premium_since?: string;
    permissions: string;
    pending?: boolean;
    nick?: string;
    mute: boolean;
    deaf: boolean;
  };
  user?: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
  token: string;
  version: number;
  data?: {
    id: string;
    name: string;
    type: number;
    options?: {
      name: string;
      type: number;
      value: string | number | boolean;
    }[];
  };
};

export async function verifyRequest(request: Request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({error: "Missing signature or timestamp"}, {status: 400});
  }

  const rawBody = await request.text();

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY!, "hex"),
  );

  if (!isVerified) {
    throw new Error("Invalid signature");
  }

  return JSON.parse(rawBody) as DiscordInteraction;
}
