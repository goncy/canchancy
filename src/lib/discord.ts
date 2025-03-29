import nacl from "tweetnacl";

export type DiscordInteraction = {
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

type DiscordMessage = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    global_name: string;
  };
  timestamp: string;
};

export async function verifyRequest(request: Request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    throw new Error("Missing signature or timestamp");
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

export async function getMessage(
  messageId: string,
  channelId: string = process.env.DEFAULT_CHANNEL_ID!,
): Promise<DiscordMessage> {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "No error body");

    throw new Error(
      `Failed to fetch message: ${response.status} ${response.statusText}\n` +
        `Channel ID: ${process.env.DISCORD_GUILD_ID}\n` +
        `Message ID: ${messageId}\n` +
        `Error body: ${errorBody}`,
    );
  }

  const message = await response.json();

  return message;
}
