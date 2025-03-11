# Fulboncy Discord Bot - Installation Guide

This guide will walk you through the process of setting up and deploying the Fulboncy Discord bot

## Prerequisites

- A Discord account with permission to create applications
- A server where you have permission to add bots
- Access to Google Sheets for player and location data

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on "New Application" and give your bot a name (e.g., "Fulboncy-test")
3. Navigate to the "Bot" tab and click "Add Bot"

## Step 2: Configure Bot Permissions

1. In the "Bot" tab, under "Bot Permissions", enable:
   - "Send Messages"
   - "Use Application Commands"

## Step 3: Get Your Bot Credentials

Collect the following credentials that you'll need for your `.env.local` file:

1. From the "General Information" tab:
   - `APPLICATION_ID`: Copy your Application ID

2. From the "Bot" tab:
   - `BOT_TOKEN`: Click "Reset Token" and copy the new token
   - `DISCORD_PUBLIC_KEY`: Copy the Public Key

## Step 4: Add Bot to Your Server

1. Go to the "Installation" tab
2. Select the scopes:
   - `bot`
   - `applications.commands`
3. Select the bot permissions:
   - "Send Messages"
4. Copy the generated URL in the Install Link section and open it in your browser
5. Select the server you want to add the bot to and authorize it
6. After adding the bot:
   - Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
   - Right-click on your server and select "Copy ID" for `DISCORD_GUILD_ID`
   - Right-click on your default channel and select "Copy ID" for `DEFAULT_CHANNEL_ID`

## Step 5: Configure Google Sheets Data Sources

1. Set up two Google Sheets:
   - One for players data
   - One for locations data
2. Publish each sheet to the web:
   - File > Share > Publish to web
   - Choose "Tab-separated values (.tsv)" as the format
   - Copy the published URLs for `PLAYERS_TSV` and `LOCATIONS_TSV`

## Step 6: Configure the Project

1. Create a `.env.local` file in the root directory with the following content:
   ```
   # Discord Bot Configuration
   DISCORD_PUBLIC_KEY=your_discord_public_key_here
   APPLICATION_ID=your_discord_application_id_here
   DISCORD_GUILD_ID=your_discord_guild_id_here
   DEFAULT_CHANNEL_ID=your_default_channel_id_here
   BOT_TOKEN=your_discord_bot_token_here

   # Application Security
   SECRET=your_secret_key_here

   # Google Sheets Data Sources
   PLAYERS_TSV=your_players_sheet_tsv_url_here
   LOCATIONS_TSV=your_locations_sheet_tsv_url_here
   ```
   
   Replace the placeholder values with your actual credentials. For `SECRET`, you can generate a random string to use for authentication.

## Step 7: Run the application

1. Install the dependencies:
   ```bash
   pnpm install
   ```

2. Run the application:
   ```bash
   pnpm dev
   ```

3. Use localtunnel to expose the application to the internet:
   ```bash
   npx localtunnel --port 3000
   ```

## Step 8: Configure Discord Interactions Endpoint

1. Go back to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to the "General Information" tab
4. Scroll down to "Interactions Endpoint URL"
5. Enter your application URL followed by `/api/interactions` (e.g., `https://abcd.loca.lt/api/interactions`)
6. Click "Save Changes"

## Step 9: Register Bot Commands

1. Make a GET request to your application's register endpoint with your secret:
   ```
   https://abcd.loca.lt/api/interactions/register?secret=your_secret_key_here
   ```
   
   You can do this by simply visiting the URL in your browser.

2. You should receive a JSON response confirming that the commands have been registered

## Step 10: Test the Bot

1. Go to your Discord server
2. Type `/reserva` and you should see the command appear
3. Fill in the required parameters:
   - `lugar`: Select a location (Castro or Golazo)
   - `fecha`: Enter a date in YYYY-MM-DD format
4. Submit the command
5. The bot should respond with available courts for the selected location and date

## Additional Resources

- [Discord Developer Documentation](https://discord.com/developers/docs)