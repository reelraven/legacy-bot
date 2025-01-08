const config = require("../../config");
const client = global.client;
const { ActivityType } = require("discord.js");
const { CronJob } = require("cron");
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = async() => {
  const getType = (type) => {
    switch (type) {
      case "COMPETING":
        return ActivityType.Competing;

      case "LISTENING":
        return ActivityType.Listening;

      case "PLAYING":
        return ActivityType.Playing;

      case "WATCHING":
        return ActivityType.Watching;

      case "STREAMING":
        return ActivityType.Streaming;
    }
  };

  

setInterval(async () => {
    client.user.setPresence({
      status: config.Presence.Status || "online",
      activities: [
        {
          name: config.Presence.Message[Math.floor(Math.random() * config.Presence.Message.length)] || "Raven ❤️",
          type: getType(config.Presence.Type || "PLAYING")
        },
      ],
    });
  }, 10000);



 

 const channel = client.channels.cache.get("1316846916276981861");
  if (!channel || channel.type !== 2) { // 2 = Voice Channel
    console.log('Ses kanalı bulunamadı veya yanlış türde!');
    return;
  }
  
  joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  console.log('🟢 Ses kanalına başarıyla bağlanıldı!');


}

module.exports.conf = {
name: "ready"
}