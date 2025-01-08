const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const client = global.client;
const db = client.db;
const fetch = require("node-fetch")
module.exports = {
    name: "hug",
    usage: "hug [@user/id]",
    aliases: ["sarıl"],
    execute: async (client, message, args) => {
        const member = message.mentions.members.first();
        if(!member) return message.reply("Bir kullanıcı belirtin")
        const response = await fetch("https://nekos.life/api/v2/img/hug")   
        const data = await response.json();

        let embed = new EmbedBuilder()
        .setImage(data.url)
        message.reply({embeds: [embed]})
    }
};
