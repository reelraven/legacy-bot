const { AttachmentBuilder } = require('discord.js');
const Canvafy = require('canvafy');
const dolars = require("../../schemas/coin/dolar.js");

module.exports = {
    name: "topcoin",
    usage: "topcoin",
    aliases: ["coinlb"],
    execute: async (client, message, args, embed) => {
        // Tüm dolar verilerini al (guildID'ye göre)
        let dolarData = await dolars.find({ guildID: message.guild.id });

        // Eğer veri bulunamazsa, hata mesajı gönder
        if (!dolarData || dolarData.length === 0) {
            return message.reply("Liderlik tablosu verisi alınamadı.");
        }

        // Kullanıcıları dolar miktarına göre azalan sırayla sıralıyoruz
        dolarData.sort((a, b) => b.dolar - a.dolar);

        // İlk 10 kullanıcıyı alıyoruz
        const topUsers = dolarData.slice(0, 10);

        // Kullanıcı verilerini canvafy formatına dönüştür
        const usersData = topUsers.map((userData, index) => {
            const user = message.guild.members.cache.get(userData.userID);
            return {
                top: index + 1,
                avatar: user ? user.user.displayAvatarURL({ format: 'png', dynamic: true }) : "https://cdn.discordapp.com/embed/avatars/0.png",
                tag: user ? user.user.tag : "Bilinmeyen Kullanıcı",
                score: `Coin: ${userData.dolar}`
            };
        });

        // Liderlik tablosu oluştur
        try {
            const top = await new Canvafy.Top()
                .setBackground("image", "https://i.imgur.com/cti8pAK.png")
                .setColors({
                    box: '#212121',
                    username: '#ffffff',
                    score: '#ffffff',
                    firstRank: '#f7c716',
                    secondRank: '#9e9e9e',
                    thirdRank: '#94610f'
                })
                .setUsersData(usersData)
                .build();

            // Canvas'ı resim olarak oluştur
            const buffer = top; 
            const attachment = new AttachmentBuilder(buffer, 'leaderboard.png');

            // Resmi gönder
            return message.reply({ files: [attachment] });
        } catch (error) {
            console.error('Liderlik tablosu oluşturulurken bir hata oluştu:', error);
            return message.reply("Liderlik tablosu oluşturulurken bir hata oluştu.");
        }
    }
};
