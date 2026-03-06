const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Bot is running");
});

app.post("/typeform", async (req, res) => {
  try {
    console.log("Incoming body:", JSON.stringify(req.body, null, 2));

    const discordId =
      req.body.discord_id ||
      req.body.form_response?.hidden?.discord_id;

    console.log("Resolved discordId:", discordId);

    if (!discordId) {
      return res.status(400).send("Missing discord_id");
    }

    const guild = client.guilds.cache.get("929823996134957148");
    console.log("Guild found:", !!guild);

    if (!guild) {
      return res.status(500).send("Guild not found. Make sure the bot is in the server.");
    }

    const member = await guild.members.fetch(String(discordId));
    console.log("Member found:", member.user.tag);

    await member.roles.remove("1479241671395901501");
    console.log("Removed pending role");

    await member.roles.add("1074167210618126357");
    console.log("Added free member role");

    return res.status(200).send("Roles updated");
  } catch (error) {
    console.error("Webhook error full object:", error);
    console.error("Webhook error message:", error.message);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error("Login failed:", error);
    process.exit(1);
  }
});
