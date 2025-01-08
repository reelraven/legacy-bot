const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const client = global.client;
const db = client.db;
const fetch = require("node-fetch")
module.exports = {
    name: "kiss",
    usage: "kiss [@user/id]",
    aliases: ["öp"],
    execute: async (client, message, args) => {
        const member = message.mentions.members.first();
        if(!member) return message.reply("Bir kullanıcı belirtin")
        const kiss = await fetch("https://nekos.life/api/v2/img/kiss")   
        const data = await kiss.json();

        let embed = new EmbedBuilder()
        .setImage(data.url)
        message.reply({embeds: [embed]})
    }
};
