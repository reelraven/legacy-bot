const client = global.client;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType } = require("discord.js");
const config = require("../../config");
const ms = require('ms');
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstMessageDate: { type: Date, default: Date.now }
});

// Mongoose modeli
const User = mongoose.model('User', userSchema);
let hgmesajlar = [
    `Hoş geldin! Bugün seninle burası daha da renkli oldu! <:karw:1314271705472045137>`,
    `Hoş geldin! Sanırım bu günün yıldızı sensin! <:karw:1314271705472045137>`,
    `Hoş geldin! Geldin de ortamın havası bir anda değişti! <:karw:1314271705472045137>`,
    `Hoş geldin! Aramıza katılman günün en güzel sürprizi oldu! <:karw:1314271705472045137>`,
    `Hoş geldin! Sanırım beklediğimiz enerji kaynağı sonunda burada! <:karw:1314271705472045137>`,
    `Hoş geldin! Seninle bu yolculuk çok daha keyifli olacak! <:karw:1314271705472045137>`,
    `Hoş geldin! Bugün yepyeni bir başlangıç seninle geldi! <:karw:1314271705472045137>`,
    `Hoş geldin! Burası artık eskisi gibi olmayacak, farkın şimdiden hissediliyor! <:karw:1314271705472045137>`,
    `Hoş geldin! Bugün burada bir iz bırakacağından eminiz! <:karw:1314271705472045137>`,
    `Hoş geldin! Unutulmaz bir yolculuğa çıkmaya hazır mısın? <:karw:1314271705472045137>`,
    `Hoş geldin! Burada yepyeni bir başlangıç yapmaya ne dersin? <:karw:1314271705472045137>`,
    `Hoş geldin! Sunucumuza ilk mesajını bırakmanla birlikte yolculuk başlasın! <:karw:1314271705472045137>`,
    `Hoş geldin! İlk adımınla sunucumuza renk kattın, çok iyi başladın! <:karw:1314271705472045137>`
  ]
module.exports = async (message) => {
    const randomMessage = hgmesajlar[Math.floor(Math.random() * hgmesajlar.length)]; // Mesajları rastgele seç

  let hgmesaj = new EmbedBuilder()
      .setTitle("Hoş geldin")
      .setDescription(`${message.author}, Sunucumuza ilk mesajını attı. Bu büyük bir adım.\n\nDaha havalı ve güzel bir profil için <#1280585388251152425> ve <#1280570577450565672> şu kanallara göz atabilirsin.`)
      .setColor("Random")
  
    // Bot mesajlarını veya DM'leri dikkate almayalım
    if (message.author.bot || !message.guild || message.system) return;
  
    try {
      // Kullanıcının veritabanında olup olmadığını kontrol et
      const user = await User.findOne({ userId: message.author.id });
  
      if (!user) {
        // Eğer kullanıcı bulunmazsa, bu ilk mesajdır
        const newUser = new User({
          userId: message.author.id
        });
  
        // Yeni kullanıcıyı kaydet
        await newUser.save();
  
        // Kullanıcıya özel bir karşılama mesajı gönder
        await message.reply({ content: randomMessage, embeds: [hgmesaj] });
      }
    } catch (err) {
      console.error('Veritabanı hatası:', err);
    }  

}

module.exports.conf = { 
name: "messageCreate"
}