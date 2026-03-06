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

client.on("guildMemberAdd", async (member) => {
  console.log(`New member joined: ${member.user.tag}`);

  try {

    // GET WELCOME CHANNEL (by name)
    const welcomeChannel = member.guild.channels.cache.find(
      channel => channel.name === "welcome👋"
    );

    if (!welcomeChannel) {
      console.log("Welcome channel not found");
      return;
    }

    const formLink =
      `https://rn9klegl44q.typeform.com/to/pgROQxLr?discord_id=${member.id}`;

    await welcomeChannel.send(
`Hey ${member}!

Welcome to our discord community. To access our free content including:

✅ Live Trading
✅ Alerts + Signals
✅ Free Course Content
✅ And More!

Please fill out this onboarding form so we know exactly how to tailor your experience so you get REAL results in our community.

We actually care about your success and you should too. So take 30 seconds to fill out this form and you will gain INSTANT access to all of our resources.

- Tristan

${formLink}`
    );

    console.log("Welcome message sent");

    // GIVE PENDING ROLE
    await member.roles.add("1479241671395901501");
    console.log("Pending role added");

  } catch (error) {
    console.error("guildMemberAdd error:", error);
  }
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

    if (!guild) {
      return res.status(500).send("Guild not found. Make sure the bot is in the server.");
    }

    const member = await guild.members.fetch(String(discordId));

    console.log("Member found:", member.user.tag);

    await member.roles.remove("1479241671395901501");
    console.log("Pending role removed");

    await member.roles.add("1074167210618126357");
    console.log("Free Member role added");

    return res.status(200).send("Roles updated");

  } catch (error) {
    console.error("Webhook error:", error);
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