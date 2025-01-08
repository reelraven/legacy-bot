const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const client = global.client;
const db = client.db;
const fetch = require("node-fetch")
module.exports = {
    name: "meow",
    usage: "meow [@user/id]",
    aliases: ["kedi"],
    execute: async (client, message, args) => {
        const member = message.mentions.members.first();
        const response = await fetch("https://nekos.life/api/v2/img/meow")   
        const data = await response.json();

        let embed = new EmbedBuilder()
        .setImage(data.url)
        message.reply({embeds: [embed]})
    }
};
