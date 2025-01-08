const Discord = require("discord.js");
const client = global.client;
const moment = require("moment");
const cezapuan = require("../../schemas/system/cezapuan.js")
const ceza = require("../../schemas/system/ceza.js")
const penals = require("../../schemas/system/penals.js")
const { table } = require('table');
const ms = require("ms")
moment.locale("tr");
module.exports = {
    name: "sicil",
    usage: "sicil",
    aliases: [],
    execute: async (client, message, args) => {

        const allowedRoleIDs = ["1266470865856368781", "1266532539212894279"];
        const hasRole = allowedRoleIDs.some(roleID => message.member.roles.cache.has(roleID));
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.Administrator) && !hasRole) {
            return message.reply("Bu komutu kullanmaya yetkiniz yok!");
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const cezaData = await ceza.findOne({ guildID: message.guild.id, userID: member.user.id });
        const cezapuanData = await cezapuan.findOne({ userID: member.user.id });
        await penals.find({ guildID: message.guild.id, userID: member.user.id })  
        .sort({ date: -1 })  
        .then(async (res) => {  
            // Buradaki res yerine veri setini kullanabilirsiniz  
            let xd = [  
                ["ID", "Tarih", "Ceza", "Sebep"]  
            ];  
    
            let xd2 = [  
                ["ID", "Ceza", "Tarih", "Bitiş", "Yetkili", "Sebep"]  
            ];

                let config = {
                    border: {
                        topBody: ``,
                        topJoin: ``,
                        topLeft: ``,
                        topRight: ``,

                        bottomBody: ``,
                        bottomJoin: ``,
                        bottomLeft: ``,
                        bottomRight: ``,

                        bodyLeft: `│`,
                        bodyRight: `│`,
                        bodyJoin: `│`,

                        joinBody: ``,
                        joinLeft: ``,
                        joinRight: ``,
                        joinJoin: ``
                    }
                };

                res.map(x => {
                    xd.push([x.id, `${moment(x.date).format("LLL")}`, x.type, x.reason])
                })

                res.map(x => {
                    let userTag = client.users.cache.get(x.staff) ? client.users.cache.get(x.staff).tag : "Bilinmeyen Kullanıcı";
                    xd2.push([x.id, x.type, `${moment(x.date).format("LLL")}`, `${x.finishDate ? `${moment(x.finishDate).format("LLL")}` : "Yok"}`, userTag, x.reason])
                })

                let raven = table(xd.slice(0, 15), config)
                let white = table(xd2, config)

                let data = await penals.find({ guildID: message.guild.id, userID: member.user.id, }).sort({ date: -1 });
                if (data.length === 0) return message.channel.send({ content: `${member.toString()} üyesinin sicili temiz!` }).then((e) => setTimeout(() => { e.delete(); }, 5000));

                const row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('dosya').setEmoji("🚫").setStyle(Discord.ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('sayi').setEmoji("❔").setStyle(Discord.ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('iptal').setEmoji("909485171240218634").setStyle(Discord.ButtonStyle.Danger),
                    );

                let msg = await message.channel.send({ content: `${member} kullanıcısının toplam **${cezaData ? cezaData.ceza.length : 0}** cezası bulunmakta son 15 ceza aşağıda belirtilmiştir. Tüm ceza bilgi dosyasını görüntülemek için 🚫 emojisine, ceza sayılarına bakmak için ❔ emojisine basabilirsin.\nTek bir cezaya detaylı bakmak için \`.cezasorgu ID\` komutunu kullanabilirsiniz. \`\`\`cs\n${raven}\n\`\`\``, components: [row] })

                var filter = (button) => button.user.id === message.author.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 30000 })

                collector.on('collect', async (button) => {

                    if (button.customId === "dosya") {
                        row.components[0].setDisabled(true)
                        msg.edit({ components: [row] });
                        button.reply({ content: `${member} kullanıcısının toplamda **${cezaData ? cezaData.ceza.length : 0}** cezası  bulunmaktadır ve aşağıdaki belgede yazmaktadır.`, files: [{ attachment: Buffer.from(white), name: `${member.user.username}_sicil.txt` }], components: [], ephemeral: true });
                    } else if (button.customId === "sayi") {
                        row.components[1].setDisabled(true)
                        msg.edit({ components: [row] });
                        let sec = res.map(x => (x.type))
                        let chatMute = sec.filter(x => x == "CHAT-MUTE").length || 0
                        let voiceMute = sec.filter(x => x == "VOICE-MUTE").length || 0
                        let tjail = sec.filter(x => x == "TEMP-JAIL").length || 0
                        let jail = sec.filter(x => x == "JAIL").length || 0
                        let ban = sec.filter(x => x == "BAN").length || 0
                        button.reply({ content: `\`\`\`cs\n${member.user.username} kullanıcısının ceza bilgileri aşağıda belirtilmiştir:\n\nChat Mute: ${chatMute} kez.\nSes Mute: ${voiceMute} kez.\nCezalı Bilgisi: ${tjail + jail} kez.\nBan Bilgisi: ${ban} kez.\n\nKullanıcı toplamda ${cezaData ? cezaData.ceza.length : 0} kez kural ihlali yapmış, kullanıcının Toplam Ceza Puanı: ${cezapuanData ? cezapuanData.cezapuan : 0} \`\`\``, ephemeral: true })
                    } else if (button.customId === "iptal") {
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        row.components[2].setDisabled(true)
                        msg.edit({ components: [row] });
                        button.reply({ content: "İşlem başarıyla iptal edildi!", ephemeral: true })
                    }
                })
                collector.on('end', async (button, reason) => {
                    row.components[0].setDisabled(true)
                    row.components[1].setDisabled(true)
                    row.components[2].setDisabled(true)
                    msg.edit({ components: [row] });
                })
            })
    }
}