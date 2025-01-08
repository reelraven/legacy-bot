const client = global.client;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType } = require("discord.js");
const config = require("../../config");

module.exports = async (member) => {

let kanal = "1265332308916043917"

member.guild.channels.cache.get(kanal).send("<@&1310399509964128266>").then(async msg => {
    setTimeout(async () => {
        if (msg) await msg.delete(); // 5 saniye sonra mesajı sil
    }, 5000);
});

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 gün (milisaniye cinsinden)
  const MEMBER_ROLE_ID = "1260644515077816370"; // 7 günden eski hesaplar için Üye rolü ID'si
  const NEW_USER_ROLE_ID = "1320753187711352883"; // 7 günden yeni hesaplar için Yeni Kullanıcı rolü ID'si

  try {
    // Kullanıcının hesap oluşturma zamanını al
    const accountCreationTime = member.user.createdTimestamp;
    const now = Date.now();

    // Hesap oluşturulma süresine göre rol ekle
    if (now - accountCreationTime >= SEVEN_DAYS) {
      await member.roles.add(MEMBER_ROLE_ID);
    } else {
      await member.roles.add(NEW_USER_ROLE_ID);
    }

  } catch (error) {
    console.error(`Rol eklenirken bir hata oluştu: ${error.message}`);
  }
};


module.exports.conf = { 
name: "guildMemberAdd"
}