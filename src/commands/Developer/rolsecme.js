const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../../../config")
const client = global.client;
const db = client.db;

let roles = {
    etkinlik: "1260644515052781625",
    cekilis: "1260644515052781627",
    deadchat: "1288438014623875073",
    turnuva: "1266183545408458833",
    soru: "1260644515052781626"
}

module.exports = {
    name: "rolmenu",
    usage: "",
    aliases: [],
    execute: async (client, message, args) => {

        if (!["501827050777215007"].includes(message.author.id)) {
            return message.delete({ timeout: 100 });
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('etkinlik').setLabel('Etkinlik Katılımcısı').setEmoji("🎁").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('cekilis').setLabel('Çekiliş Katılımcısı').setEmoji("🎉").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('deadchat').setLabel('Dead Chat').setEmoji("💀").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('turnuva').setLabel('Turnuva Katılımcısı').setEmoji("🎯").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('soru').setLabel('Günlük Soru').setEmoji("❔").setStyle(ButtonStyle.Secondary),
        );

        message.channel.send({
            content: `Sunucumuz da sizlerin rahatsız olmaması için \`@everyone & @here\` atmamak için bildirim rolleri açmış bulunmaktayız;

<@&${roles.etkinlik}>: Rolünü alırsanız sunucuda düzenlenecek konserlerden ve birçok etkinlikten haberdar olabilirsiniz.
<@&${roles.cekilis}>: Rolünü alırsanız sunucuda birçok ödülün verildiği çekilişlerden haberdar olursunuz.
<@&${roles.deadchat}>: Sohbetin öleceği zamanlarda atılır. Sizlerde sohbetin ölmemesi için destek olmak isterseniz bu rolü alabilirsiniz.
<@&${roles.turnuva}>: Rolünü alırsanız sunucuda düzenlenecek turnuvalardan haberdar olabilirsiniz.
<@&${roles.soru}>: Rolünü alırsanız sunucudaki günlük sorulardan haberdar olabilirsiniz.`, components: [actionRow]
        })

    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const member = interaction.member;
    if (interaction.customId === 'etkinlik') {
        if (member.roles.cache.has(roles.etkinlik)) {
            // Rolü kaldır
            await member.roles.remove(roles.etkinlik);
            return interaction.reply({ content: 'Rol sizden kaldırıldı!', ephemeral: true });
        } else {
            // Rolü ekle
            await member.roles.add(roles.etkinlik);
            return interaction.reply({ content: 'Rol size eklendi!', ephemeral: true });
        }
    }

    if (interaction.customId === 'cekilis') {
        if (member.roles.cache.has(roles.cekilis)) {
            // Rolü kaldır
            await member.roles.remove(roles.cekilis);
            return interaction.reply({ content: 'Rol sizden kaldırıldı!', ephemeral: true });
        } else {
            // Rolü ekle
            await member.roles.add(roles.cekilis);
            return interaction.reply({ content: 'Rol size eklendi!', ephemeral: true });
        }
    }

    if (interaction.customId === 'deadchat') {
        if (member.roles.cache.has(roles.deadchat)) {
            // Rolü kaldır
            await member.roles.remove(roles.deadchat);
            return interaction.reply({ content: 'Rol sizden kaldırıldı!', ephemeral: true });
        } else {
            // Rolü ekle
            await member.roles.add(roles.deadchat);
            return interaction.reply({ content: 'Rol size eklendi!', ephemeral: true });
        }
    }

    if (interaction.customId === 'turnuva') {
        if (member.roles.cache.has(roles.turnuva)) {
            // Rolü kaldır
            await member.roles.remove(roles.turnuva);
            return interaction.reply({ content: 'Rol sizden kaldırıldı!', ephemeral: true });
        } else {
            // Rolü ekle
            await member.roles.add(roles.turnuva);
            return interaction.reply({ content: 'Rol size eklendi!', ephemeral: true });
        }
    }

    if (interaction.customId === 'soru') {
        if (member.roles.cache.has(roles.soru)) {
            // Rolü kaldır
            await member.roles.remove(roles.soru);
            return interaction.reply({ content: 'Rol sizden kaldırıldı!', ephemeral: true });
        } else {
            // Rolü ekle
            await member.roles.add(roles.soru);
            return interaction.reply({ content: 'Rol size eklendi!', ephemeral: true });
        }
    }
});