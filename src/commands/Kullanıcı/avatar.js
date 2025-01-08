const { ApplicationCommandOptionType,ActionRowBuilder,ButtonBuilder,ButtonStyle ,PermissionsBitField} = require("discord.js");
const config = require("../../../config")
const client = global.client;
const db = client.db;
module.exports = {
    name: "avatar",
    usage:"avatar [@user/id]",
    aliases: ["pp","av","pfp"],
    execute: async (client, message, args) => {
let member = args.length > 0 ? message.mentions.users.first() || await client.users.fetch(args[0]) || message.author : message.author
let Link = new ActionRowBuilder({components:[new ButtonBuilder({label:"Tarayıcıda Aç", style:ButtonStyle.Link, url: member.displayAvatarURL({dynamic:true})})]})
let msg = await message.channel.send({ content: `${member.displayAvatarURL({ dynamic: true, size: 4096 })}`, components: [Link] })
    }
}