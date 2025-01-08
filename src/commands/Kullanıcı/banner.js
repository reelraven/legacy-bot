const { ApplicationCommandOptionType,ActionRowBuilder,ButtonBuilder,ButtonStyle ,PermissionsBitField} = require("discord.js");
const axios = require('axios');
const { DiscordBanners } = require('discord-banners');
const client = global.client;
const db = client.db;
module.exports = {
    name: "banner",
    usage:"banner [@user/id]",
    aliases: ["afis"],
    execute: async (client, message, args) => {
  const member = args.length > 0 ? message.mentions.users.first() || await client.users.fetch(args[0]) || message.author : message.author
    async function ertuBanner(user, client) {
        const response = await axios.get(`https://discord.com/api/v9/users/${user}`, { headers: { 'Authorization': `Bot ${client.token}` } });
        if(!response.data.banner) return `Kullanıcının bannerini bulunmamaktadır!`
        if(response.data.banner.startsWith('a_')) return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.gif?size=512`
        else return(`https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.png?size=512`)
      }

      let banner = await ertuBanner(member.id, client)

      let msg = await message.channel.send({ content: `${banner}`})
    }
}