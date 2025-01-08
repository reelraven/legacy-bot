const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const client = global.client;
const db = client.db;
const canvafy = require("canvafy");

module.exports = {
    name: "ship",
    usage: "ship [@etiket]",
    aliases: ["ask"],
    execute: async (client, message, args, embed) => {
        const mentionedMembers = Array.from(message.mentions.members.values());
        let user = mentionedMembers[0] || message.guild.members.cache.get(args[0]);
        let user2 = mentionedMembers[1] || message.guild.members.cache.get(args[1]);

        const maleRoleIds = "1266183562919415819";
        const femaleRoleIds = "1266183561652994059";

        if (!user && !user2) {
            user = message.member;

            let userGenderRole = null;

            const isMale = Array.isArray(maleRoleIds) && maleRoleIds.some(roleId => user.roles?.cache.has(roleId));
            const isFemale = Array.isArray(femaleRoleIds) && femaleRoleIds.some(roleId => user.roles?.cache.has(roleId));

            if (isMale) {
                userGenderRole = 'male';
                user2 = message.guild.members.cache
                    .filter(member => Array.isArray(femaleRoleIds) && femaleRoleIds.some(roleId => member.roles?.cache.has(roleId)) && !member.user.bot)
                    .random();
            } else if (isFemale) {
                userGenderRole = 'female';
                user2 = message.guild.members.cache
                    .filter(member => Array.isArray(maleRoleIds) && maleRoleIds.some(roleId => member.roles?.cache.has(roleId)) && !member.user.bot)
                    .random();
            } else {
                user2 = message.guild.members.cache
                    .filter(member => !member.user.bot && member.id !== message.author.id)
                    .random();
            }
        } else if (!user2) {
            user2 = user;
            user = message.member;
        }

        if (user2.user.bot || user.user.bot) return message.channel.send({ content: `> **Botlarla Ship Yapamazsın!**` }).sil(5);

        // Özel kullanıcı kontrolü
        const specialUserIds = ['501827050777215007']; // Özel kullanıcı ID'leri
        let customNumber = Math.floor(Math.random() * 101);

        if (specialUserIds.includes(user.id) || specialUserIds.includes(user2.id)) {
            customNumber = 100; // Özel kullanıcı ile eşleştirildiğinde %100 yap
        }

        const ship = await new canvafy.Ship()
            .setAvatars(user.user.displayAvatarURL({ dynamic: true, extension: "png" }), user2.user.displayAvatarURL({ dynamic: true, extension: "png" }))
            .setBackground("image", `${message.guild.bannerURL({ extension: "png", size: 2048 }) !== null ? message.guild.bannerURL({ extension: "png", size: 2048 }) : ayar.shipArkaplan}`)
            .setBorder("#ff1d8e")
            .setCustomNumber(customNumber)
            .setOverlayOpacity(0.5)
            .build();

        const sentMessage = await message.reply({
            content: `>             **${user.user.tag} ❓ ${user2.user.tag}**`,
            files: [{
                attachment: ship,
                name: `ship-${message.member.id}.png`
            }]
        });
    }
};
