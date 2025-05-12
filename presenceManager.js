const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const presenceData = new Map();

function getWeekRange() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return `du ${format(monday)} au ${format(sunday)}`;
}

function createPresenceEmbed() {
  const range = getWeekRange();
  const embed = new EmbedBuilder()
    .setTitle(`📆 Présences de la semaine ${range}`)
    .setDescription('Cliquez sur les boutons pour indiquer votre présence ! Vous pouvez modifier vos choix à tout moment.')
    .setColor(0x2ecc71)
    .setTimestamp();

  embed.addFields(days.map(day => ({ name: `🗓️ ${day}`, value: '_Personne_', inline: false })));
  return embed;
}

function createButtonRow() {
  const rows = [];
  for (let i = 0; i < days.length; i += 5) {
    const row = new ActionRowBuilder();
    days.slice(i, i + 5).forEach((day, index) => {
      row.addComponents(new ButtonBuilder()
        .setCustomId(`day_${i + index}`)
        .setLabel(day)
        .setStyle(ButtonStyle.Primary));
    });
    rows.push(row);
  }
  return rows;
}

async function handleButtonClick(interaction) {
  const messageId = interaction.message.id;
  const userId = interaction.user.id;
  const userTag = `<@${userId}>`;
  const dayIndex = parseInt(interaction.customId.split('_')[1]);
  const day = days[dayIndex];

  if (!presenceData.has(messageId)) presenceData.set(messageId, {});
  const weeklyData = presenceData.get(messageId);
  if (!weeklyData[day]) weeklyData[day] = [];

  const userPresent = weeklyData[day].includes(userTag);
  if (userPresent) {
    weeklyData[day] = weeklyData[day].filter(u => u !== userTag);
  } else {
    weeklyData[day].push(userTag);
  }

  const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
  updatedEmbed.setFields(days.map(d => ({
    name: `🗓️ ${d}`,
    value: (weeklyData[d] || []).join(', ') || '_Personne_',
    inline: false
  })));

  await interaction.update({ embeds: [updatedEmbed] });
}

module.exports = { createPresenceEmbed, createButtonRow, handleButtonClick, presenceData };
