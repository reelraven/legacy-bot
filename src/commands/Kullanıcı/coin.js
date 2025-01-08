const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, AttachmentBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const dolarss = require("../../schemas/coin/dolar.js");
const client = global.client;
const db = client.db;
const Canvas = require('canvas')

module.exports = {
    name: "coin",
    usage: "coin [@user/id]",
    aliases: ["dolar"],
    execute: async (client, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        let dolarData = await dolarss.findOne({ guildID: message.guild.id, userID: member.id });
        let kanallar = ["1260644516399157398"];

        if (!kanallar.some((x) => message.channel.id.toLowerCase().includes(x))) {
            const sentMessage = await message.reply({ content: `Bu komutu sadece <#1260644516399157398> kanallarında kullanabilirsiniz.` });
            setTimeout(() => {
                sentMessage.delete().catch(err => console.error("Mesaj silinemedi:", err));
            }, 5000);
            return;
        }

        let canvas = Canvas.createCanvas(1080, 400),
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
        let background = await Canvas.loadImage(client.guilds.cache.get(message.guild.id).banner ? client.guilds.cache.get(message.guild.id).banner ? client.guilds.cache.get(message.guild.id).bannerURL({extension:"png"}) + `?size=4096` : "https://i.imgur.com/yJzHsO7.jpeg": "https://i.imgur.com/yJzHsO7.jpeg");
        ctx.drawImage(background, 0, 0, 1080, 400);
        ctx.restore();
        ctx.beginPath();
        ctx.globalAlpha = 0.5
        ctx.fillStyle = "#000000";

        ctx.moveTo(50,  22);
        ctx.lineTo(canvas.width - 50,  22);
        ctx.quadraticCurveTo(canvas.width - 50,  22, canvas.width -  22, 50);
        ctx.lineTo(canvas.width -  22, canvas.height - 50);
        ctx.quadraticCurveTo(canvas.width - 25, canvas.height -  22, canvas.width - 50, canvas.height -  22);
        ctx.lineTo(50, canvas.height - 22);
        ctx.quadraticCurveTo(25, canvas.height -  22,  22, canvas.height - 50);
        ctx.lineTo( 22, 50);
        ctx.quadraticCurveTo( 22,  22, 50,  22);
        ctx.fill();
        ctx.globalAlpha = 1
        ctx.closePath();
        ctx.stroke();
        let coin = await Canvas.loadImage("https://cdn.discordapp.com/emojis/998211961462464532.png?size=96&quality=lossless")
         ctx.drawImage(coin, canvas.width - 740, 200, 75, 65);
         ctx.fillStyle = "#000000"; 
         ctx.lineWidth = 3;
         ctx.fillStyle = "#e7d02e";
         ctx.font = applyText(canvas, member.user.displayName + " UYESININ HESABI", 40, 600, "Bold");
        ctx.fillText(member.user.displayName + " UYESININ HESABI", canvas.width - 740, canvas.height - 230);
       ctx.font = "30px Bold";
       ctx.strokeStyle = "#e7d02e";
       ctx.lineWidth = 3;
       ctx.strokeText(dolarData ? Math.floor(parseInt(dolarData.dolar)) : 0 + " "+ "LEGACY" +" PARASI", canvas.width - 650, 240);
       ctx.fillStyle = "#ffffff";
       ctx.fillText(dolarData ? Math.floor(parseInt(dolarData.dolar)) : 0+ " "+ "LEGACY" + " PARASI", canvas.width - 650, 240);
       ctx.font = "70px Bold";
       ctx.strokeStyle = "#000000";
       ctx.lineWidth = 8;
       ctx.strokeText("LEGACY", canvas.width - 650, canvas.height - 300);
       ctx.fillStyle = "#e7d02e";
       ctx.fillText("LEGACY", canvas.width - 650, canvas.height - 300);
   
       ctx.beginPath();
       ctx.lineWidth = 10;
       ctx.strokeStyle = "#e7d02e";
       ctx.arc(193, 200, 130, 0, Math.PI * 2, true);
       ctx.stroke();
       ctx.closePath();
       ctx.clip();
       const avatar = await Canvas.loadImage(member.user.avatar ? member.user.avatarURL({ extension: "jpg" }) : "https://cdn.discordapp.com/attachments/1102669633372311675/1116873769823256596/0oO5sAneb9lJP6l8c6DH4aj6f85qNpplQVHmPmbbBxAukDnlO7DarDW0b-kEIHa8SQ.png");
       ctx.drawImage(avatar, 58, 70, 270, 270);
       const img = new AttachmentBuilder().setFile(canvas.toBuffer())

       let msg = await message.reply({content: `💳 | ${member.id == message.member.id ? `${member}` : `${member} üyesinin`} **Legacy Parası**  ${member.id == message.member.id ? "hesabın" : "hesabı"} aşağıda görüntülenmektedir.`, files: [img]})

    }
};


function applyText(canvas, text, defaultFontSize, width, font){
    const ctx = canvas.getContext("2d");
    do {
        ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > width);
    return ctx.font;
  }