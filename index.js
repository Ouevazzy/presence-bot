const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const express = require('express');
const {
  createPresenceEmbed,
  createButtonRow,
  handleButtonClick,
  presenceData
} = require('./presenceManager');

// ✅ Lecture des variables d’environnement (Railway)
const token = process.env.token;
const channelId = process.env.channelId;

console.log("📦 Node.js version :", process.version);
console.log("🚀 Tentative de connexion à Discord...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  // Cron → chaque lundi à 7h00 UTC = 9h00 heure suisse
  cron.schedule('0 7 * * 1', async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.error("❌ Salon introuvable.");

      const embed = createPresenceEmbed();
      const rows = createButtonRow();

      const message = await channel.send({ embeds: [embed], components: rows });
      presenceData.set(message.id, {});
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi automatique :", err);
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  await handleButtonClick(interaction);
});

// 🧪 Commande manuelle
client.on('messageCreate', async (message) => {
  if (message.content === '!testPresence' && !message.author.bot) {
    const embed = createPresenceEmbed();
    const rows = createButtonRow();
    const sentMessage = await message.channel.send({ embeds: [embed], components: rows });
    presenceData.set(sentMessage.id, {});
  }
});

client.login(token).catch((err) => {
  console.error("❌ Erreur de connexion :", err);
});

// 🔁 Ping HTTP pour garder Railway réveillé (optionnel mais utile)
const app = express();
app.get('/', (req, res) => res.send('Bot is running.'));
app.listen(3000, () => console.log("🌐 Serveur HTTP actif sur le port 3000"));
