const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const GUILD_ID = "929823996134957148";
const PENDING_ROLE_ID = "1479241671395901501";
const FREE_MEMBER_ROLE_ID = "1074167210618126357";
const STAFF_ROLE_ID = "1394202084831920199";

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(
    "Connected guilds:",
    client.guilds.cache.map(g => `${g.name} (${g.id})`).join(", ")
  );
});

console.log("guildMemberAdd listener loaded");

client.on("guildMemberAdd", async (member) => {

  console.log(`New member joined: ${member.user.tag}`);

  try {

    await member.roles.add(PENDING_ROLE_ID);
    console.log("Pending role added");

    const guild = member.guild;

    const safeName =
      `onboarding-${member.user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 80) || `onboarding-${member.id}`;

    const formLink =
      `https://rn9klegl44q.typeform.com/to/pgROQxLr?discord_id=${member.id}`;

    const permissionOverwrites = [

      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },

      {
        id: member.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },

      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },

      {
        id: guild.members.me.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ManageRoles,
        ],
      }

    ];

    const onboardingChannel = await guild.channels.create({
      name: safeName,
      type: ChannelType.GuildText,
      permissionOverwrites,
      topic: `Private onboarding channel | User ID: ${member.id}`,
    });

    console.log(`Created onboarding channel: ${onboardingChannel.name}`);

    await onboardingChannel.send(

`Hey ${member}!

Welcome to our discord community! To access our free content including:

✅ Live Trading
✅ Alerts + Signals
✅ Free Course Content
✅ And More!

Please fill out this onboarding form so we know exactly how to tailor your experience so you get REAL results in our community.

DISCLAIMER: YOU WILL NOT BE ABLE TO TRADE LIVE WITH US OR WATCH OUR FREE CONTENT UNTIL YOU FILL OUT THIS FORM.

We actually care about your success and you should too. So take 30 seconds to fill out this form and you will gain INSTANT access to all of our resources.

- Tristan

${formLink}`

    );

    console.log("Onboarding message sent");

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

    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
      return res.status(500).send("Guild not found");
    }

    const member = await guild.members.fetch(String(discordId));

    console.log("Member found:", member.user.tag);

    if (member.roles.cache.has(FREE_MEMBER_ROLE_ID)) {
      return res.status(200).send("User already verified");
    }

    await member.roles.remove(PENDING_ROLE_ID);
    console.log("Pending role removed");

    await member.roles.add(FREE_MEMBER_ROLE_ID);
    console.log("Free Member role added");

    const onboardingChannel = guild.channels.cache.find(
      channel =>
        channel.topic &&
        channel.topic.includes(`User ID: ${member.id}`)
    );

    if (onboardingChannel) {

      await onboardingChannel.send(
`✅ You are all set, ${member}.

Your access has been unlocked. Welcome to the community.`
      );

      setTimeout(async () => {

        try {

          await onboardingChannel.delete("User completed onboarding");
          console.log(`Deleted onboarding channel for ${member.user.tag}`);

        } catch (deleteError) {
          console.error("Failed to delete onboarding channel:", deleteError);
        }

      }, 10000);

    }

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