const Discord = require("discord.js");
const client = global.client;
const db = client.db;
const snipeData = require("../../schemas/system/snipeData")
const moment = require('moment');
require('moment-duration-format');
module.exports = {
    name: "snipe",
    usage: "snipe",
    aliases: ["sn"],
    execute: async (client, message, args) => {

        const allowedRoleIDs = ["1266470865856368781", "1266532539212894279"];
        const hasRole = allowedRoleIDs.some(roleID => message.member.roles.cache.has(roleID));
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.Administrator) && !hasRole) {
            return message.reply("Bu komutu kullanmaya yetkiniz yok!");
        }

        let RData = await snipeData.findOne({ guildID: message.guild.id })
        if (!RData) return message.reply(`Son silinen mesaj bulunamadı canim benim!`)

        let ravenembed = new Discord.EmbedBuilder()
            .setColor('#2F3136')
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .setDescription(`**Mesaj Sahibi:** <@${RData.userID}> (\`${RData.userID}\`)
**Mesaj:** <t:${Math.floor(RData.deletedTime / 1000)}:R> silinmiş.`)
        if (RData.messageContent) ravenembed.addFields({ name: "Mesaj İçeriği", value: RData.messageContent })
        if (RData.Image) ravenembed.addFields({ name: "Mesaj bir dosya", value: `[Görüntülemek için Tıkla](${RData.Image})` })
        const sentMessage = await message.channel.send({ embeds: [ravenembed] });
        setTimeout(() => {
            sentMessage.delete();
        }, 10000); // 10000 ms = 10 saniy
    }
}