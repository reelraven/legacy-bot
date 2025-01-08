const { PermissionsBitField, ActionRowBuilder, ChannelType, Emoji, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "say",
  usage: "say",
  aliases: [],
  execute: async (client, message, args) => {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel
        .send({ content: "Yeterli yetkin bulunmuyor!" })
        .then((msg) => setTimeout(() => msg.delete(), 5000));
    }

    var takviye = await client.emojiSayi(message.guild.premiumSubscriptionCount)
    var TotalMember = await client.emojiSayi(message.guild.memberCount)
    var sesli = await client.emojiSayi(message.guild.members.cache.filter((x) => x.voice.channel && !x.user.bot).size)
    var bot = message.guild.channels.cache.filter(channel => channel.type == ChannelType.GuildVoice).map(channel => channel.members.filter(member => member.user.bot).size).reduce((a, b) => a + b);

    let embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`
\` ❯ \` Şu anda Toplam **${sesli}** Kişi Seslide. (\`+${bot} Bot\`)
\` ❯ \` Sunucuda **${TotalMember}** Adet Üye Var (\`+${message.guild.members.cache.filter(m => m.presence && m.presence.status !== "offline").size} Aktif.\`)
\` ❯ \` Toplamda **${takviye}** Adet Boost Basılmış. (\`${message.guild.premiumTier ? `${message.guild.premiumTier}. Seviye` : `0. Seviye`}\`)`)

    message.reply({ embeds: [embed] })

  }
};

