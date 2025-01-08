const { Classic } = require('musicard');
const { ActivityType } = require("discord.js");

module.exports = {
    name: "spotify",
    usage: "spotify",
    aliases: ["spo"],
    execute: async (client, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        // Kullanıcının Spotify aktivitesini kontrol et
        if (
            member &&
            member.presence &&
            member.presence.activities &&
            member.presence.activities.some(activity => activity.name === "Spotify" && activity.type === ActivityType.Listening)
        ) {
            const status = member.presence.activities.find(activity => activity.type === ActivityType.Listening);

            // Spotify zaman hesaplamaları
            const elapsed = new Date(Date.now()).getTime() - new Date(status.timestamps.start).getTime();
            const duration = new Date(status.timestamps.end).getTime() - new Date(status.timestamps.start).getTime();
            const progress = Math.round((elapsed / duration) * 100);

            const formatTime = (ms) => {
                const minutes = Math.floor(ms / 60000);
                const seconds = Math.floor((ms % 60000) / 1000);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };

            // Kart için ayarlar
            const options = {
                thumbnailImage: `https://i.scdn.co/image/${status.assets?.largeImage?.slice(8)}`,
                backgroundColor: '#070707',
                progress: progress,
                progressColor: '#1DB954',
                progressBarColor: '#201d1d',
                name: status.details || 'Bilinmeyen Başlık',
                nameColor: '#ffffff',
                author: status.state || 'Bilinmeyen Sanatçı',
                authorColor: '#696969',
                startTime: formatTime(elapsed),
                endTime: formatTime(duration),
                timeColor: '#ffffff',
                borderColor: '#0000FF',
                borderWidth: 4
            };

            // Kart oluşturma
            const musicardImage = await Classic(options);

            // Kartı gönder
            return message.reply({ files: [{ name: "spotify-card.png", attachment: musicardImage }] });
        } else {
            return message.reply({ content: `Kullanıcı şu anda Spotify'da bir şarkı dinlemiyor.` });
        }
    }
};
