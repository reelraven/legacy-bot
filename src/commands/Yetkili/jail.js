const { PermissionsBitField,PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moment = require("moment");
const jailLimit = new Map();
const ms = require("ms")
moment.locale("tr");
const conf = require("../../../config.js")
const cezapuan = require("../../schemas/system/cezapuan.js")
const ceza = require("../../schemas/system/ceza.js")
module.exports = {
    name: "jail",
    usage: "jail",
    aliases: [],
    execute: async (client, message, args) => {

        const allowedRoleIDs = ["1266470865856368781", "1266532539212894279"];
        const hasRole = allowedRoleIDs.some(roleID => message.member.roles.cache.has(roleID));
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasRole) {
            return message.reply("Bu komutu kullanmaya yetkiniz yok!");
        }


       
    }
}