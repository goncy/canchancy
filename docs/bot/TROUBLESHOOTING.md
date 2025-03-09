# Canchancy Discord Bot - Troubleshooting Guide

This guide provides solutions for common issues you might encounter when setting up and using the bot

## "The Application Did Not Respond" Error

If you're seeing "The application did not respond" when using the `/reserva` command, here are several potential solutions:

### 1. Verify Endpoint Configuration

Make sure Discord can reach your application's endpoint.

**Steps to verify:**
1. Check that your application is deployed and running
2. Verify the Interactions Endpoint URL in Discord Developer Portal is correct:
   - It should be `https://your-domain.com/api/interactions`
   - Discord must be able to reach this URL from the internet
3. Test the endpoint with a tool like Postman to ensure it's responding

### 2. Check Environment Variables

Incorrect environment variables can cause silent failures.

**Verify these variables are set correctly:**
- `DISCORD_PUBLIC_KEY`: Must match exactly what's in your Discord Developer Portal
- `APPLICATION_ID`: Your Discord application ID
- `GUILD_ID`: The ID of your Discord server
- `BOT_TOKEN`: Your bot's token
- `SECRET`: Your custom secret for the register endpoint

### 3. Add Comprehensive Logging

Add detailed logging to help identify where the issue is occurring:

```typescript
// At the top of src/app/api/interactions/route.ts
export async function POST(request: Request) {
  console.log("Received request to interactions endpoint");
  
  try {
    // Log request headers to check for Discord's verification headers
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const body = await verifyRequest(request);
    console.log("Request verified successfully", body.type, body.data?.name);
    
    // Rest of your code...
  } catch (error) {
    console.error("Error verifying request:", error);
    return NextResponse.json({ error: "Failed to verify request" }, { status: 401 });
  }
}
```

## Command Registration Issues

If you're having trouble registering commands:

### 1. Check Registration Response

When you visit the registration endpoint, you should receive a JSON response. If you get an error:

- Verify the `SECRET` parameter matches your environment variable
- Check that your `APPLICATION_ID`, `GUILD_ID`, and `BOT_TOKEN` are correct
- Ensure your bot has the "applications.commands" scope

### 2. Command Visibility

If commands are registered but not visible:

- It may take up to an hour for commands to propagate to all Discord servers
- Try restarting your Discord client
- Verify the bot has been added to your server with the correct permissions
