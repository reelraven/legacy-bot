const Discord = require("discord.js");
const client = global.client;
const moment = require("moment");
const cezapuan = require("../../schemas/system/cezapuan.js")
const ceza = require("../../schemas/system/ceza.js")
const penals = require("../../schemas/system/penals.js")
moment.locale("tr");
module.exports = {
    name: "cezasorgu",
    usage: "cezasorgu",
    aliases: [],
    execute: async (client, message, args) => {

        const allowedRoleIDs = ["1266470865856368781", "1266532539212894279"];
        const hasRole = allowedRoleIDs.some(roleID => message.member.roles.cache.has(roleID));
        if (!message.member.permissions.has(Discord.PermissionFlagsBits.Administrator) && !hasRole) {
            return message.reply("Bu komutu kullanmaya yetkiniz yok!");
        }

        if (isNaN(args[0])) return message.channel.send({ content: "Ceza ID'si bir sayı olmalıdır!" }).then((e) => setTimeout(() => { e.delete(); }, 5000));
        const data = await penals.findOne({ guildID: message.guild.id, id: args[0] });
        if (!data) return message.channel.send({ content: `${args[0]} ID'li bir ceza bulunamadı!` }).then((e) => setTimeout(() => { e.delete(); }, 5000));
        const cezaData = await ceza.findOne({ guildID: message.guild.id, userID: data.userID });
        const cezapuanData = await cezapuan.findOne({ userID: data.userID });
        var cezasayı = `${cezapuanData ? cezapuanData.cezapuan : 0}`

        let durum;
        if (cezasayı < 5) durum = "Çok Güvenli";
        if (cezasayı >= 5 && cezasayı < 20) durum = "Güvenli";
        if (cezasayı >= 20 && cezasayı < 30) durum = "Şüpheli";
        if (cezasayı >= 30 && cezasayı < 40) durum = "Tehlikeli";
        if (cezasayı >= 50) durum = "Çok Tehlikeli";

        let userTag = client.users.cache.get(data.staff) ? client.users.cache.get(data.staff).tag : "Bilinmeyen Kullanıcı";

    const xd = embed
    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true, size: 2048 })})
    .setDescription(`
${message.guild.name} sunucusunda <@${data.userID}> kullanıcısının ID'si verilen ceza bilgisi aşağıda listelenmiştir.

**Ceza-i İşlemi**
\`\`\`cs
ID => ${data.id}
Ceza Durumu: ${data.active ? `🟢 (Aktif)` : `🔴 (Bitti)`}
Yetkili => ${userTag}
Tür => ${data.type}
Sebep => ${data.reason}
Bitiş Tarihi => ${data.finishDate ? `${moment(data.finishDate).format("LLL")}` : "Bulunmamaktadır."}
\`\`\`
**Tüm Ceza-i İşlemler** (\`Toplam ${cezaData ? cezaData.ceza.length : 0} Ceza - ${durum} \`)
`)

    message.channel.send({ embeds: [xd] });
    }
}