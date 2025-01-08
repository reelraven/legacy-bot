const Discord = require("discord.js");
const client = global.client;
const moment = require("moment");
const cezapuan = require("../../schemas/system/cezapuan.js")
const ceza = require("../../schemas/system/ceza.js")
moment.locale("tr");
module.exports = {
    name: "cezapuan",
    usage: "cezapuan",
    aliases: [],
    execute: async (client, message, args) => {

        const allowedRoleIDs = ["1266470865856368781", "1266532539212894279"];
        const hasRole = allowedRoleIDs.some(roleID => message.member.roles.cache.has(roleID));
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.Administrator) && !hasRole) {
            return message.reply("Bu komutu kullanmaya yetkiniz yok!");
        }


        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.channel.send({ content: "Böyle bir kullanıcı bulunamadı!" }).then((e) => setTimeout(() => { e.delete(); }, 5000));
            return
        }

        const cezaData = await ceza.findOne({ guildID: message.guild.id, userID: member.id });
        const cezapuanData = await cezapuan.findOne({ userID: member.user.id });
        message.reply({ content: `${member} kişisinin toplamda \`${cezapuanData ? cezapuanData.cezapuan : 0}\` ceza puanı ve (Toplam **${cezaData ? cezaData.ceza.length : 0}** Ceza) olarak gözükmekte!` })
    }
}