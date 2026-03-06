const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

app.post("/typeform", async (req, res) => {
  try {
    const discordId = req.body.discord_id;

    if (!discordId) {
      return res.status(400).send("Missing discord_id");
    }

    const guild = await client.guilds.fetch(929823996134957148); // 

    const member = await guild.members.fetch(discordId);

    await member.roles.remove(1479241671395901501); // 
    await member.roles.add(1074167210618126357); // 

    return res.status(200).send("Roles updated");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});