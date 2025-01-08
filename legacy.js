const { EmbedBuilder, ModalBuilder, Partials, resolveColor, Client, Collection, TextInputBuilder, GatewayIntentBits, ActionRowBuilder, TextInputStyle, ActivityType, OAuth2Scopes, ButtonBuilder, ButtonStyle, PermissionsBitField, AttachmentBuilder, ComponentType } = require("discord.js");
const conf = require("./config.js")
const db = require("quick.db");
const mongoose = require("mongoose")
const axios = require("axios");
const LIMITOR = 50;
const fs = require('fs');
const cron = require('node-cron');
const rss = require('rss-converter');
const client = global.client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Sunucu verilerini çekmek içindir
    GatewayIntentBits.GuildBans, // Sunucu Ban verilerini çekmek içindir
    GatewayIntentBits.GuildEmojisAndStickers, // Sunucu Emoji ve Sticker verisini çekmek içindir
    GatewayIntentBits.GuildIntegrations, // Sunucu Entagrasyon verisini çekmek içindir 
    GatewayIntentBits.GuildInvites, // Sunucu Davet verisini çekmek içindir
    GatewayIntentBits.GuildMembers, // Sunucu Üye verisini çekmek içindir
    GatewayIntentBits.GuildMessageReactions, // Sunucu Mesaj Tepki verisini çekmek içindir
    GatewayIntentBits.GuildMessageTyping, // Sunucu Mesaj Yazma verisini çekmek içindir
    GatewayIntentBits.GuildMessages, // Sunucu Mesaj verilerini çekmek içindir
    GatewayIntentBits.GuildPresences, // Sunucu Durum verisini çekmek içindir
    GatewayIntentBits.GuildScheduledEvents, // Sunucu Etkinlikler verisini çekmek içindir
    GatewayIntentBits.GuildVoiceStates, // Sunucu Ses verilerini çekmek içindir
    GatewayIntentBits.GuildWebhooks, // Sunucu webhook verilerini çekmek içindir
    GatewayIntentBits.DirectMessages, // DM Mesaj verilerini çekmek içindir
    GatewayIntentBits.DirectMessageTyping, // DM Mesaj Yazma verisini çekmek içindir
    GatewayIntentBits.DirectMessageReactions, // DM Mesaj Tepki verisini çekmek içindir
    GatewayIntentBits.MessageContent // Mesaj verisini çekmek içindir
  ],
  scopes: [
    OAuth2Scopes.Bot,
    OAuth2Scopes.ApplicationsCommands
  ], partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember,
    Partials.GuildScheduledEvent
  ]
});
const invites = client.invites = {};
const TodaysDate = global.TodaysDate = function () {
  const moment = require('moment');
  const now = moment();
  const month = now.month() + 1;
  const day = now.date();
  const year = now.year()
  let nowDate = `${day}.${month}.${year}`;
  return nowDate;
}
const guildInvites = global.guildInvites = new Map()
const { readdir } = require("fs");
const commands = client.commands = new Collection();
const aliases = client.aliases = new Collection();
readdir("./src/commands/", (err, files) => {
  if (err) console.error(err)
  files.forEach(f => {
    readdir("./src/commands/" + f, (err2, files2) => {
      if (err2) console.log(err2)
      files2.forEach(file => {
        let prop = require(`./src/commands/${f}/` + file);
        console.log(`🧮 [KOMUT!] Başarıyla ${prop.name} Komutu Yüklendi!`);
        commands.set(prop.name, prop);
        prop.aliases.forEach(alias => { aliases.set(alias, prop.name); });
      });
    });
  });
});
readdir("./src/events", (err, files) => {
  if (err) return console.error(err);
  files.filter((file) => file.endsWith(".js")).forEach((file) => {
    let prop = require(`./src/events/${file}`);
    if (!prop.conf) return;
    client.on(prop.conf.name, prop);
    console.log(`📚 [EVENT!] Başarıyla ${prop.conf.name} Eventi Yüklendi!`);
  });
});

Collection.prototype.array = function () { return [...this.values()] }

const { emitWarning } = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') { return; }
  if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') { return; }
  return emitWarning(warning, ...args);
};

Promise.prototype.sil = function (time) {
  if (this) this.then(s => {
    if (s.deletable) {
      setTimeout(async () => {
        s.delete().catch(e => { });
      }, time * 1000)
    }
  });
};

const emojiBul = global.emojiBul = async function (name) {
  const emoji = await client.guilds.cache.get(conf.guildID).emojis.cache.find(x => x.name === name);
  if (emoji) return await emoji.id
  else return console.log(`${name} isimli emoji bulunamadı!`)
}

mongoose.connect("");

mongoose.connection.on("connected", () => {
  console.log("🟢 Database bağlantısı tamamlandı!");
});

mongoose.connection.on("error", () => {
  console.log("🔴 Database bağlantısı kurulamadı!");
});

client.login("").then(() =>
  console.log(`🟢 ${client.user.tag} Başarıyla Giriş Yaptı!`)
).catch((err) => console.log(`🔴 Bot Giriş Yapamadı / Sebep: ${err}`));


const joinLeaveTracker = new Map(); // Kullanıcıların giriş çıkışlarını takip etmek için
const MAX_JOINS = 5; // Maksimum giriş sayısı
const TIME_LIMIT = 300000; // 5 dakika (milisaniye cinsinden)
const LOG_CHANNEL_ID = '1270094629127323710'; // Log kanalı ID'sini buraya yazın

client.on('guildMemberAdd', member => {
  const userId = member.id;
  const guildId = member.guild.id;

  if (!joinLeaveTracker.has(guildId)) {
    joinLeaveTracker.set(guildId, new Map());
  }

  const guildTracker = joinLeaveTracker.get(guildId);

  if (!guildTracker.has(userId)) {
    guildTracker.set(userId, []);
  }

  const userTimestamps = guildTracker.get(userId);
  const now = Date.now();

  // Eski zaman damgalarını temizle
  while (userTimestamps.length > 0 && now - userTimestamps[0] > TIME_LIMIT) {
    userTimestamps.shift();
  }

  userTimestamps.push(now);

  if (userTimestamps.length >= MAX_JOINS) {
    // Kullanıcıyı yasakla
    member.guild.members.ban(userId, { reason: 'Çok sık giriş-çıkış yaptı.' }).then(() => {
      console.log(`${member.user.tag} yasaklandı.`);

      // Log kanalına mesaj gönder
      const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel && logChannel.isTextBased()) {
        logChannel.send(`🚫 **${member.user.tag}** (${userId}) çok sık giriş-çıkış yaptığı için yasaklandı.`);
      }
    }).catch(err => {
      console.error(`Kullanıcı yasaklanırken hata oluştu: ${err}`);
    });

    // Kullanıcıyı takip listesinden kaldır
    guildTracker.delete(userId);
  }
});

client.on('guildMemberRemove', member => {
  const guildId = member.guild.id;
  const userId = member.id;

  if (!joinLeaveTracker.has(guildId)) return;

  const guildTracker = joinLeaveTracker.get(guildId);

  if (guildTracker.has(userId)) {
    const userTimestamps = guildTracker.get(userId);
    userTimestamps.push(Date.now());
  }
});

client.emoji = function (x) {
  return client.emojis.cache.get(client.emojiler[x]);
};
const emoji = global.emoji;

const sayiEmojiler = {
  0: "<a:sifir:1321414803834535968>",
  1: "<a:bir:1321414786361069639>",
  2: "<a:iki:1321414796863733813>",
  3: "<a:uc:1321414806540124180>",
  4: "<a:dort:1321414793000783903>",
  5: "<a:bes:1321414783014010890>",
  6: "<a:alti:1321414779998437406>",
  7: "<a:yedi:1321414809614286849>",
  8: "<a:sekiz:1321414800445669376>",
  9: "<a:dokuz:1321414789104144477>"
};
const penals = require("./src/schemas/system/penals.js")
client.penalize = async (guildID, userID, type, active = true, staff, reason, temp = false, finishDate = undefined) => {
  let id = await penals.find({ guildID });
  id = id ? id.length + 1 : 1;
  return await new penals({ id, userID, guildID, type, active, staff, reason, temp, finishDate }).save();
};


client.emojiSayi = function (sayi) {
  let yeniMetin = "";
  const arr = Array.from(sayi.toString());
  for (let x = 0; x < arr.length; x++) {
    yeniMetin += (sayiEmojiler[arr[x]] === "" ? arr[x] : sayiEmojiler[arr[x]]);
  }
  return yeniMetin;
};

global.emoji = client.emoji = function (x) {
  return client.emojis.cache.get(client.emojiler[x]);
};

client.sayilariCevir = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const conversations = new Map();
const Canvas = require('@napi-rs/canvas');
const Canvas2 = require('canvas')
Canvas2.registerFont(`./src/fonts/theboldfont.ttf`, { family: "Bold" });
Canvas2.registerFont(`./src/fonts/SketchMatch.ttf`, { family: "SketchMatch" });
Canvas2.registerFont(`./src/fonts/LuckiestGuy-Regular.ttf`, { family: "luckiest guy" });
Canvas2.registerFont(`./src/fonts/KeepCalm-Medium.ttf`, { family: "KeepCalm" });

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startProcess() {
  while (true) {
    await ilkYazan(500);  // İlk fonksiyon 500ms gecikme ile başlar
    await delay(1000 * 60 * 25);  // 5 dakika bekler
    await matematikOyunu(500);  // İkinci fonksiyon 500ms gecikme ile başlar
    await delay(1000 * 60 * 25);  // 5 dakika bekler
    await doğruKasaBul(500);  // Üçüncü fonksiyon 500ms gecikme ile başlar
    await delay(1000 * 60 * 25);  // 5 dakika bekler
    await tahminEt(500);  // Son fonksiyon 500ms gecikme ile başlar
    await delay(1000 * 60 * 25);  // 10 dakika bekler (toplamda 25 dakika olacak)
  }
}
// Başlatmak için fonksiyonu çağırıyoruz
startProcess();
const Dolars = require("./src/schemas/coin/dolar.js")
async function ilkYazan(odül = Number(Math.floor(Math.random() * 10000) + 200)) {
  const guild = client.guilds.cache.get("1260644514968764438")
  if (!guild) return;
  const kanal = guild.channels.cache.get(conf.Kanallar.chatKanali)
  if (!kanal) return;
  let kod = kodOluştur(4)
  let canvas = Canvas2.createCanvas(1080, 400),
    ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0 + Number(30), 0);
  ctx.lineTo(0 + 1080 - Number(30), 0);
  ctx.quadraticCurveTo(0 + 1080, 0, 0 + 1080, 0 + Number(30));
  ctx.lineTo(0 + 1080, 0 + 400 - Number(30));
  ctx.quadraticCurveTo(
    0 + 1080,
    0 + 400,
    0 + 1080 - Number(30),
    0 + 400
  );
  ctx.lineTo(0 + Number(30), 0 + 400);
  ctx.quadraticCurveTo(0, 0 + 400, 0, 0 + 400 - Number(30));
  ctx.lineTo(0, 0 + Number(30));
  ctx.quadraticCurveTo(0, 0, 0 + Number(30), 0);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 400);
  let background = await Canvas2.loadImage("https://i.imgur.com/cti8pAK.png");
  ctx.drawImage(background, 0, 0, 1080, 400);
  ctx.restore();
  ctx.closePath();
  ctx.beginPath();
  ctx.globalAlpha = 0.5
  ctx.fillStyle = "#000000";
  ctx.moveTo(50, 22);
  ctx.lineTo(canvas.width - 50, 22);
  ctx.quadraticCurveTo(canvas.width - 50, 22, canvas.width - 22, 50);
  ctx.lineTo(canvas.width - 22, canvas.height - 50);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 22, canvas.width - 50, canvas.height - 22);
  ctx.lineTo(50, canvas.height - 22);
  ctx.quadraticCurveTo(25, canvas.height - 22, 22, canvas.height - 50);
  ctx.lineTo(22, 50);
  ctx.quadraticCurveTo(22, 22, 50, 22);
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, "Tahmin Et.", 75, 500, "Bold");
  ctx.strokeStyle = "#ffffff";
  ctx.fillText("İlk Yazan Kazanır", 125, 125);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coin'i kazanacaksın.`, 45, 690, "Bold");
  ctx.fillText(`Hemen yaz, ${odül} Legacy coini senin olsun!`, 70, 130 + 85);
  ctx.textAlign = "center";
  let renk = ["#f8f8ff", "#f5f5f5"]
  ctx.fillStyle = renk[Math.floor(Math.random() * renk.length)]
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  ctx.font = applyText(canvas, kod, 100, 400, "luckiest guy");
  ctx.fillText(kod, 525, 350);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'kod.png' });
  let msg = await kanal.send({ content: "**Hızlı ol ve Kazan**", files: [attachment], components: [] })
  const filter = m => m.content.includes(kod);
  const collector = kanal.createMessageCollector({ filter, max: 1, time: 15000 });
  collector.on('collect', async (m) => {
    let uye = m.guild.members.cache.get(m.member.id)
    await kanal.send({ content: `**Tebrikler!** Hızlı Ol Ve Kazan Etkinliğini ${uye} Kazandı!`, files: [], files: [] }).sil(15)
    await msg.delete().catch(err => { })
    if (uye) await Dolars.updateOne({ guildID: guild.id, userID: uye.id }, { $inc: { dolar: Number(odül) } }, { upsert: true });
  });
  collector.on('end', collected => {
    msg.delete().catch(err => { })
  });
  function applyText(canvas, text, defaultFontSize, width, font) {
    const ctx = canvas.getContext("2d");
    do {
      ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > width);
    return ctx.font;
  }
  function kodOluştur(length) {
    var randomChars = '123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
  }
}

async function tahminEt(odül = Number(Math.floor(Math.random() * 4000) + 1000)) {

  const guild = client.guilds.cache.get("1260644514968764438")
  if (!guild) return;
  const kanal = guild.channels.cache.get(conf.Kanallar.chatKanali)
  if (!kanal) return;
  let cevap = Math.floor(Math.random() * 5) + 1
  let basanlar = []
  let canvas = Canvas2.createCanvas(1080, 400),
    ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0 + Number(30), 0);
  ctx.lineTo(0 + 1080 - Number(30), 0);
  ctx.quadraticCurveTo(0 + 1080, 0, 0 + 1080, 0 + Number(30));
  ctx.lineTo(0 + 1080, 0 + 400 - Number(30));
  ctx.quadraticCurveTo(
    0 + 1080,
    0 + 400,
    0 + 1080 - Number(30),
    0 + 400
  );
  ctx.lineTo(0 + Number(30), 0 + 400);
  ctx.quadraticCurveTo(0, 0 + 400, 0, 0 + 400 - Number(30));
  ctx.lineTo(0, 0 + Number(30));
  ctx.quadraticCurveTo(0, 0, 0 + Number(30), 0);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 400);
  let background = await Canvas2.loadImage("https://i.imgur.com/cti8pAK.png");
  ctx.drawImage(background, 0, 0, 1080, 400);
  ctx.restore();
  ctx.beginPath();
  ctx.globalAlpha = 0.5
  ctx.fillStyle = "#000000";
  ctx.moveTo(50, 22);
  ctx.lineTo(canvas.width - 50, 22);
  ctx.quadraticCurveTo(canvas.width - 50, 22, canvas.width - 22, 50);
  ctx.lineTo(canvas.width - 22, canvas.height - 50);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 22, canvas.width - 50, canvas.height - 22);
  ctx.lineTo(50, canvas.height - 22);
  ctx.quadraticCurveTo(25, canvas.height - 22, 22, canvas.height - 50);
  ctx.lineTo(22, 50);
  ctx.quadraticCurveTo(22, 22, 50, 22);
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, "Tahmin Et.", 75, 500, "Bold");
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coin Kazanacaksın.`, 45, 690, "Bold");
  ctx.fillText(`Doğru Cevabı Bulursan`, 350, 130 + 85);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coini Kazanacaksın.`, 45, 690, "Bold");
  ctx.fillText(`${odül} Legacy coini Kazanacaksın.`, 210, 180 + 85);
  ctx.font = applyText(canvas, "Sadece Bir Kere Hakkın Var.", 200, 710, "Bold");
  ctx.fillText("Sadece Bir Kere Hakkın Var.", 190, 310 + 40);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'tahmin.png' });
  let rakamSatirBir = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('1').setLabel('1').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('2').setLabel('2').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('3').setLabel('3').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('4').setLabel('4').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('5').setLabel('5').setStyle(ButtonStyle.Secondary)
  )
  let msg = await kanal.send({ content: "**Hızlı Ol Ve Kazan**", files: [attachment], components: [rakamSatirBir] })
  const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });
  collector.on('collect', async i => {
    if (i.customId === String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: ` Cevap hakkınızı doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      await i.reply({ content: `> **Tebrikler!** Etkinliği Hazandığınız İçin Hesabınıza +**${odül}** Legacy Doları Aktarıldı.`, ephemeral: true })
      let uye = i.guild.members.cache.get(i.user.id)
      await kanal.send({ content: `**Tebrikler!** Hızlı Ol Ve Kazan etkinliğini ${uye} Kazandı!`, files: [] }).sil(15)
      await msg.delete().catch(err => { })
      basanlar.push(i.user.id)
      if (uye) await Dolars.updateOne({ guildID: guild.id, userID: uye.id }, { $inc: { dolar: Number(odül) } }, { upsert: true });
    }
    if (i.customId != String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: `Cevap hakkınızı doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      basanlar.push(i.user.id)
      await i.reply({ content: `**Hay Aksi!** Yanlış, Artık Birdahaki Sorulara. Cevap Hakkınız Doldu!`, ephemeral: true })
    }
  });
  collector.on('end', collected => msg.delete().catch(err => { }));
  function applyText(canvas, text, defaultFontSize, width, font) {
    const ctx = canvas.getContext("2d");
    do {
      ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > width);
    return ctx.font;
  }
}

async function matematikOyunu(odül = Number(Math.floor(Math.random() * 2000) + 500)) {
  const guild = client.guilds.cache.get("1260644514968764438")
  if (!guild) return;

  const kanal = guild.channels.cache.get(conf.Kanallar.chatKanali)
  if (!kanal) return;
  var a = Math.floor(Math.random() * 400) + 200
  var b = Math.floor(Math.random() * 250)
  let cevap = '';
  let soru = '';
  let randd = ["toplama", "çıkartma", "çarpma", "bölme"]
  let sonuclandır = randd[Math.floor(Math.random() * 3)]
  if (sonuclandır == "toplama") cevap = a + b, soru = `${a} + ${b}`
  if (sonuclandır == "çıkartma") cevap = a - b, soru = `${a} - ${b}`
  if (sonuclandır == "çarpma") cevap = a * b, soru = `${a} * ${b}`
  if (sonuclandır == "bölme") cevap = a / b, soru = `${a} / ${b}`
  let basanlar = []
  let canvas = Canvas2.createCanvas(1080, 400),
    ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0 + Number(30), 0);
  ctx.lineTo(0 + 1080 - Number(30), 0);
  ctx.quadraticCurveTo(0 + 1080, 0, 0 + 1080, 0 + Number(30));
  ctx.lineTo(0 + 1080, 0 + 400 - Number(30));
  ctx.quadraticCurveTo(
    0 + 1080,
    0 + 400,
    0 + 1080 - Number(30),
    0 + 400
  );
  ctx.lineTo(0 + Number(30), 0 + 400);
  ctx.quadraticCurveTo(0, 0 + 400, 0, 0 + 400 - Number(30));
  ctx.lineTo(0, 0 + Number(30));
  ctx.quadraticCurveTo(0, 0, 0 + Number(30), 0);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 400);
  let background = await Canvas2.loadImage("https://i.imgur.com/cti8pAK.png");
  ctx.drawImage(background, 0, 0, 1080, 400);
  ctx.restore();
  ctx.beginPath();
  ctx.globalAlpha = 0.5
  ctx.fillStyle = "#000000";
  ctx.moveTo(50, 22);
  ctx.lineTo(canvas.width - 50, 22);
  ctx.quadraticCurveTo(canvas.width - 50, 22, canvas.width - 22, 50);
  ctx.lineTo(canvas.width - 22, canvas.height - 50);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 22, canvas.width - 50, canvas.height - 22);
  ctx.lineTo(50, canvas.height - 22);
  ctx.quadraticCurveTo(25, canvas.height - 22, 22, canvas.height - 50);
  ctx.lineTo(22, 50);
  ctx.quadraticCurveTo(22, 22, 50, 22);
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, "Tahmin Et.", 75, 500, "Bold");
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff3f3";
  ctx.font = applyText(canvas, `${odül} Legacy coin Kazanacaksın.`, 100, 890, "luckiest guy");
  ctx.fillText(`${soru}`, 550, 120 + 85);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coin Kazanacaksın.`, 45, 690, "Bold");
  ctx.fillText(`Doğru Cevabı Bulursan`, 360, 180 + 65);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coin Kazanacaksın.`, 45, 690, "Bold");
  ctx.fillText(`${odül} Legacy coin Kazanacaksın.`, 210, 260 + 40);
  ctx.font = applyText(canvas, "Sadece Bir Kere Hakkın Var.", 45, 690, "Bold");
  ctx.fillText("Sadece Bir Kere Hakkın Var.", 260, 310 + 40);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'image.png' });
  let buttons = [
    new ButtonBuilder().setCustomId('qwe').setLabel(Math.floor(Math.random() * 550).toString()).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('qwe1').setLabel(Math.floor(Math.random() * 942).toString()).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('qwe2').setLabel(Math.floor(Math.random() * 250).toString()).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(cevap.toString()).setLabel(cevap.toString()).setStyle(ButtonStyle.Success),  // 'cevap' değerini string'e çeviriyoruz
    new ButtonBuilder().setCustomId('qwe6').setLabel(Math.floor(Math.random() * 2000).toString()).setStyle(ButtonStyle.Success)
  ];

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  // Diziyi doğru şekilde karıştırıyoruz
  const shuffledButtons = shuffleArray(buttons);

  // Karıştırılmış butonları ActionRowBuilder ile ekliyoruz
  const buttonRow = new ActionRowBuilder().addComponents(
    shuffledButtons // Karıştırılmış butonları doğrudan kullanıyoruz
  );

  // Mesajı gönderiyoruz
  let msg = await kanal.send({
    content: "**Cevabı Bul!**",
    files: [attachment],
    components: [buttonRow]
  });
  const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });
  collector.on('collect', async i => {
    if (i.customId === String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: `Cevap Hakkınızı Doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      await i.reply({ content: `> **Tebrikler!** Etkinliği Hazandığınız İçin Hesabınıza +**${odül}** Legacy coin Aktarıldı.`, ephemeral: true })
      let uye = i.guild.members.cache.get(i.user.id)
      basanlar.push(i.user.id)
      kanal.send({ content: `**Tebrikler!** Cevabı Bul Etkinliğini ${uye} Kazandı!`, files: [] }).sil(15)
      msg.delete().catch(err => { })
      if (uye) await Dolars.updateOne({ guildID: guild.id, userID: uye.id }, { $inc: { dolar: Number(odül) } }, { upsert: true });
    }
    if (i.customId != String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: `Cevap Hakkınızı Doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      basanlar.push(i.user.id)
      await i.reply({ content: `**Hay Aksi!** Yanlış, Artık Birdahaki Sorulara. Cevap Hakkınız Doldu!`, ephemeral: true })
    }
  });

  collector.on('end', collected => msg.delete().catch(err => { }));
  function applyText(canvas, text, defaultFontSize, width, font) {
    const ctx = canvas.getContext("2d");
    do {
      ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > width);
    return ctx.font;
  }
}

async function doğruKasaBul(odül = Number(Math.floor(Math.random() * 100000) + 3000)) {
  const guild = client.guilds.cache.get("1260644514968764438")
  if (!guild) return;
  const kanal = guild.channels.cache.get(conf.Kanallar.chatKanali)
  if (!kanal) return;
  let cevap = Math.floor(Math.random() * 5) + 1
  let basanlar = []
  let canvas = Canvas2.createCanvas(1080, 400),
    ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(0 + Number(30), 0);
  ctx.lineTo(0 + 1080 - Number(30), 0);
  ctx.quadraticCurveTo(0 + 1080, 0, 0 + 1080, 0 + Number(30));
  ctx.lineTo(0 + 1080, 0 + 400 - Number(30));
  ctx.quadraticCurveTo(
    0 + 1080,
    0 + 400,
    0 + 1080 - Number(30),
    0 + 400
  );
  ctx.lineTo(0 + Number(30), 0 + 400);
  ctx.quadraticCurveTo(0, 0 + 400, 0, 0 + 400 - Number(30));
  ctx.lineTo(0, 0 + Number(30));
  ctx.quadraticCurveTo(0, 0, 0 + Number(30), 0);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 400);
  let background = await Canvas2.loadImage("https://i.imgur.com/cti8pAK.png");
  ctx.drawImage(background, 0, 0, 1080, 400);
  ctx.restore();
  ctx.beginPath();
  ctx.globalAlpha = 0.5
  ctx.fillStyle = "#000000";
  ctx.moveTo(50, 22);
  ctx.lineTo(canvas.width - 50, 22);
  ctx.quadraticCurveTo(canvas.width - 50, 22, canvas.width - 22, 50);
  ctx.lineTo(canvas.width - 22, canvas.height - 50);
  ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 22, canvas.width - 50, canvas.height - 22);
  ctx.lineTo(50, canvas.height - 22);
  ctx.quadraticCurveTo(25, canvas.height - 22, 22, canvas.height - 50);
  ctx.lineTo(22, 50);
  ctx.quadraticCurveTo(22, 22, 50, 22);
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, "Tahmin Et", 75, 500, "Bold");
  ctx.fillText("Doğru Kasayı Bul", 210, 125);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = applyText(canvas, `${odül} Legacy coin Kazanıcaksın.`, 45, 690, "Bold");
  ctx.fillText(`Kasaların Sana Süprizi Var`, 180, 180 + 85);
  ctx.font = applyText(canvas, "Sadece Bir Kere Hakkın Var.", 45, 690, "Bold");
  ctx.fillText("Sadece Bir Kere Hakkın Var.", 210, 310 + 40);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), 'image.png');
  let rakamSatirBir = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('1').setEmoji("1061214943418011678").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('2').setEmoji("1061214943418011678").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('3').setEmoji("1061214943418011678").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('4').setEmoji("1061214943418011678").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('5').setEmoji("1061214943418011678").setStyle(ButtonStyle.Secondary))
  let msg = await kanal.send({ content: "**Doğru Kasayı Bul!**", files: [attachment], components: [rakamSatirBir] })
  const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });
  collector.on('collect', async i => {
    if (i.customId === String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: ` Cevap Hakkınızı Doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      await i.reply({ content: `> **Tebrikler!** Etkinliği Hazandığınız İçin Hesabınıza +**${odül}** Legacy coini Aktarıldı.`, ephemeral: true })
      let uye = i.guild.members.cache.get(i.user.id)
      kanal.send({ content: ` **Tebrikler!** Doğru Kasayı Bul Etkinliğini ${uye} Kazandı!`, files: [] }).sil(15)
      msg.delete().catch(err => { })
      basanlar.push(i.user.id)
      if (uye) await Dolars.updateOne({ guildID: guild.id, userID: uye.id }, { $inc: { dolar: Number(odül) } }, { upsert: true });
    }
    if (i.customId != String(cevap)) {
      if (basanlar.includes(i.user.id)) return await i.reply({ content: `Cevap Hakkınızı Doldurmuşsunuz. Üzgünüm!`, ephemeral: true });
      basanlar.push(i.user.id)
      await i.reply({ content: `**Hay Aksi!** Yanlış, Artık Birdahaki Sorulara. Cevap Hakkınız Doldu!`, ephemeral: true })
    }
  });
  collector.on('end', collected => msg.delete().catch(err => { }));
  function applyText(canvas, text, defaultFontSize, width, font) {
    const ctx = canvas.getContext("2d");
    do {
      ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > width);
    return ctx.font;
  }
}
function applyText(canvas, text, defaultFontSize, width, font) {
  const ctx = canvas.getContext("2d");
  do {
    ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
  } while (ctx.measureText(text).width > width);
  return ctx.font;
}