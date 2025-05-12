const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const cron = require('node-cron');
const express = require('express');
const { token, channelId } = require('./config.json');
const {
  createPresenceEmbed,
  createButtonRow,
  handleButtonClick,
  presenceData
} = require('./presenceManager');

console.log("📦 Node.js version :", process.version);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  cron.schedule('0 7 * * 1', async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.error('❌ Salon introuvable');

      const embed = createPresenceEmbed();
      const rows = createButtonRow();

      const message = await channel.send({ embeds: [embed], components: rows });
      presenceData.set(message.id, {});
    } catch (err) {
      console.error('❌ Erreur cron :', err);
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  try {
    await handleButtonClick(interaction);
  } catch (err) {
    console.error('❌ Interaction échouée :', err);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!testPresence') {
    try {
      const embed = createPresenceEmbed();
      const rows = createButtonRow();
      const sentMessage = await message.channel.send({ embeds: [embed], components: rows });
      presenceData.set(sentMessage.id, {});
    } catch (err) {
      console.error('❌ Message test échoué :', err);
    }
  }
});

console.log("🚀 Tentative de connexion à Discord...");
client.login(token).catch((err) => {
  console.error("❌ Erreur de connexion :", err);
});

const app = express();
app.get('/', (req, res) => res.send('Bot actif'));
app.listen(3000, () => {
  console.log('🌐 Serveur HTTP actif sur le port 3000');
});
