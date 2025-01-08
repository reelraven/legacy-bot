const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require("../../../config")
const client = global.client;
const db = client.db;
const datas = require("../../schemas/system/room")
const GuildID = ""
module.exports = {
  name: "özeloda",
  usage: ".özeloda",
  aliases: [],
  execute: async (client, message) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel
        .send({ content: "Yeterli yetkin bulunmuyor!" })
        .then((msg) => setTimeout(() => msg.delete(), 5000));
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create")
        .setLabel("Oda Oluştur")
        .setEmoji("🗒️")
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Legacy Özel Oda Sistemi `, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setColor("#2e3035")
        .setDescription(
          `# <a:booster:1321626632007581727><a:booster:1321626632007581727><a:booster:1321626632007581727>Boosterlara özel<a:booster:1321626632007581727><a:booster:1321626632007581727><a:booster:1321626632007581727> \n\n` +
          `**Butona tıklayarak özel oda oluşturabilirsiniz.**\n\n⚠️ **Not:** ` +
          `Kanal sohbet kısmından ayarlarınızı yapabilirsiniz.`
        )
        .setImage("https://cdn.discordapp.com/attachments/1270166725182357505/1321556897437847582/1363796_1.jpeg?ex=676dab45&is=676c59c5&hm=4327021d8a111a223f94bce09b4d3c4a6e9f7e89924623b7073796c9414bb39c&");
    await message.channel.send({ embeds: [embed], components: [row] });
  },
};

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "create") {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const hasBoosted = member.premiumSince; // Eğer kullanıcı sunucuya boost basmışsa, bu değer dolu olur.

    if (!hasBoosted) {
      return interaction.reply({
        content: `❌ <@${interaction.user.id}> sadece sunucuya boost basmış kişiler özel oda oluşturabilir.`,
        ephemeral: true,
      });
    }

    // Kullanıcının daha önce oluşturduğu bir özel oda var mı kontrol et
    const data = await datas.findOne({ Owner: interaction.user.id });
    const existingChannel = data?.ID
      ? interaction.guild.channels.cache.get(data.ID)
      : null;

    if (data?.ID && existingChannel) {
      return interaction.reply({
        content: `❌ <@${interaction.user.id}> zaten özel bir odanız var.`,
        ephemeral: true,
      });
    }

    // Yeni oda oluşturma modalını hazırlıyoruz
    const createRoom = new ModalBuilder()
      .setCustomId("createroom")
      .setTitle("Oda Oluştur");

    // Oda adı için giriş alanı
    const roomNameInput = new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Oda ismini giriniz!")
      .setStyle(TextInputStyle.Short)
      .setMinLength(4)
      .setMaxLength(20)
      .setRequired(true);

    // Oda limiti için giriş alanı
    const roomLimitInput = new TextInputBuilder()
      .setCustomId("limit")
      .setLabel("Oda limiti giriniz!")
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(2)
      .setRequired(true);

    // Giriş alanlarını modal'a ekle
    createRoom.addComponents(
      new ActionRowBuilder().addComponents(roomNameInput),
      new ActionRowBuilder().addComponents(roomLimitInput)
    );

    // Kullanıcıya modal'ı göster
    interaction.showModal(createRoom);
  }

  if (interaction.customId === "createroom") {

    const roomName = interaction.fields.getTextInputValue("name")
    const roomLimit = parseInt(interaction.fields.getTextInputValue("limit"))

    if (!roomName || isNaN(roomLimit)) {
      return interaction.reply({ content: "Geçersiz oda adı veya limit.", ephemeral: true });
    }

    await interaction.reply({ content: `✅ Özel oda oluşturuldu: ${roomName}`, ephemeral: true });

  }

});


client.on('interactionCreate', async interaction => {
  const Guild = client.guilds.cache.get(config.guildID);
  const room = await datas.findOne({ Owner: interaction.user.id });
  const Channel = Guild?.channels.cache.get(room?.ID);

  if (interaction.customId === "pompalamasyon1") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    await Guild?.channels?.cache.get(room?.ID)?.permissionOverwrites.edit(config.guildID, { Connect: false, SendMessages: false });
    await interaction.reply({ content: `**${Channel.name}** kanalını başarıyla girişlere kitlediniz.`, ephemeral: true })
  } else if (interaction.customId === "pompalamasyon2") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    await Guild?.channels?.cache.get(room?.ID)?.permissionOverwrites.edit(config.guildID, { Connect: true });
    await interaction.reply({ content: `**${Channel.name}** kanalını başarıyla girişlere açtınız.`, ephemeral: true })
  } else if (interaction.customId === "pompalamasyon3") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    await Guild?.channels?.cache.get(room?.ID)?.permissionOverwrites.edit(config.guildID, { ViewChannel: false });
    await interaction.reply({ content: `**${Channel.name}** kanalını başarıyla gizlediniz.`, ephemeral: true })
  } else if (interaction.customId === "pompalamasyon4") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    await Guild?.channels?.cache.get(room?.ID)?.permissionOverwrites.edit(config.guildID, { ViewChannel: true });
    await interaction.reply({ content: `**${Channel.name}** kanalını başarıyla kullanıcılara görünür yaptınız.`, ephemeral: true })
  } else if (interaction.customId === "pompalamasyon5") {
    const pro = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("onays").setLabel("Kabul Et").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("reds").setLabel("Reddet").setStyle(ButtonStyle.Danger),
      );

    const rooms = await datas.findOne({ ID: interaction.channel.id });

    if (rooms.Owner === interaction.user.id) {
      await interaction.reply({ content: `Zaten kanal sahibi sizsiniz.`, ephemeral: true })
      return
    }

    interaction.deferUpdate(true)
    let proozi = new EmbedBuilder()
      .setDescription(`<@${rooms.Owner}>, <@${interaction.user.id}> oda sahipliğini senden almak istiyor. Kabul ediyor musun?`)
      .setFooter({ text: `30 saniye içerisinde işlem iptal edilecektir.` })
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

    let msg = await interaction.channel.send({ content: `<@${rooms.Owner}>`, embeds: [proozi], components: [pro] })
    var filter = button => button.user.id === rooms.Owner;
    let collector = await msg.createMessageComponentCollector({ filter, time: 30000 })

    collector.on("collect", async (button) => {
      if (button.customId === "onays") {
        const embeds = new EmbedBuilder()
          .setAuthor({ name: client.guilds.cache.get(config.guildID).name, iconURL: client.guilds.cache.get(config.guildID).iconURL({ dynamic: true, size: 2048 }) })
          .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
          .setTimestamp()
          .setDescription(`<@${interaction.user.id}>, <@${rooms.Owner}> kişisinden oda sahipliğini üzerine aldın.`)
        await datas.updateOne({ Owner: rooms.Owner }, { $set: { Owner: interaction.user.id } }, { upsert: true });

        collector.stop();
        button.reply({ embeds: [embeds], components: [] })
      }

      if (button.customId === "reds") {
        const embedss = new EmbedBuilder()
          .setAuthor({ name: client.guilds.cache.get(config.guildID).name, iconURL: client.guilds.cache.get(config.guildID).iconURL({ dynamic: true, size: 2048 }) })
          .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
          .setTimestamp()
          .setDescription(`<@${interaction.user.id}>, <@${rooms.Owner}> kişisinden oda sahipliği alma işlemi iptal edildi.`)

        collector.stop();
        button.reply({ embeds: [embedss], components: [] })
      }
    });
    collector.on('end', i => {
      msg.delete();
    })
  } else if (interaction.customId === "pompalamasyon6") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    const filter = m => m.author === interaction.user;
    var cevaplar = {};
    xdd: cevaplar["xd"]

    await interaction.reply({ content: `Lütfen kanalınıza girmesini istediğiniz üye(leri) etiketleyiniz. \`Örn: @realraven\``, ephemeral: true })
    interaction.channel.awaitMessages({ filter, max: 1 }).then(async function (collected) {
      collected.each(msj => cevaplar["xd"] = msj.mentions.users);

      const members = cevaplar["xd"]
        .filter((x) => !room?.Users.includes(x.id) && interaction.guild.members.cache.has(x.id))
        .map((x) => interaction.guild.members.cache.get(x.id));

      if (Guild?.channels.cache.get(room.ID)?.manageable) {
        members.map((member, idx) =>
          Guild?.channels.cache.get(room.ID).permissionOverwrites.edit(member.id, { ViewChannel: true, Connect: true }).then(async () =>
            await datas.findOneAndUpdate({ Owner: interaction.user.id }, { $push: { Users: member.id } }, { upsert: true }))
        )
      }
      await interaction.followUp({ content: `${members.map((member, idx) => `${member.toString()}`).join(", ")} üyelerinin kanalınıza girmesine başarıyla izin verdiniz.`, ephemeral: true })
    })
  } else if (interaction.customId === "pompalamasyon7") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    const members = room.Users.map((x) => {
      return {
        label: interaction.guild.members.cache.get(x)?.user?.tag ?? x,
        description: `Üyenin erişimini kaldırmak için tıkla`,
        value: x
      }
    });

    if (!members?.length) {
      interaction.reply({ content: `Odanızdan çıkarılacak üye bulunmamaktadır.`, ephemeral: true })
      return
    };
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("members").setPlaceholder('Listeyi Görüntüle').addOptions([...members])
    );
    interaction.deferUpdate(true)
    let yarak = await interaction.channel.send({ content: `Odaya erişimini kaldırmak istediğiniz üyeleri listeden seçiniz.`, components: [row] });
    const filter = i => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    yarak.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60000 }).then((x) => {
      x.values.map(async (v) => {
        await datas.findOneAndUpdate({ Owner: interaction.user.id }, { $pull: { Users: v } }, { upsert: true });
        await Channel?.permissionOverwrites.delete(v)
        let memb = client.guilds.cache.get(config.guildID).members.cache.get(v)
        if (memb && memb.voice && memb.voice.channel) {
          memb.voice.disconnect();
        }
      });
      if (yarak) yarak.delete();
      interaction.channel.send({ content: `${cyronixTik} Başarılı bir şekilde <@${x.values}> adlı üyenin odanıza erişim izni silindi.` });
    });
  } else if (interaction.customId === "pompalamasyon8") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    const editRoom = new ModalBuilder()
      .setCustomId('edit2')
      .setTitle(`${room?.Name} odasını düzenleyin`);

    let xname = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Oda isminizi giriniz!')
      .setStyle(TextInputStyle.Short)
      .setMinLength(4)
      .setMaxLength(20)
      .setValue(room?.Name)
      .setRequired(false);

    let xlimit = new TextInputBuilder()
      .setCustomId('limit')
      .setLabel('Oda limiti giriniz!')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(2)
      .setPlaceholder(`Limit: ${room?.MaxUser ?? 0}`)
      .setRequired(false);

    const xname2 = new ActionRowBuilder().addComponents(xname);
    const xlimit2 = new ActionRowBuilder().addComponents(xlimit);

    editRoom.addComponents(xname2, xlimit2);

    interaction.showModal(editRoom, {
      client: client,
      interaction: interaction
    })
  } else if (interaction.customId === "pompalamasyon9") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      return
    }
    const filter = m => m.author === interaction.user;
    var cevaplar = {};
    xddD: cevaplar["xdD"]

    await interaction.reply({ content: `Kanal sahipliğini aktarmak istediğiniz üyeyi etiketleyiniz. \`Örn: @realraven\``, ephemeral: true })
    interaction.channel.awaitMessages({ filter, max: 1 }).then(async function (collected) {
      collected.each(msj => cevaplar["xdD"] = msj.mentions.users);

      const members = cevaplar["xdD"]
        .filter((x) => interaction.guild.members.cache.has(x.id))
        .map((x) => interaction.guild.members.cache.get(x.id));

      if (members.length > 1) {
        interaction.followUp({ content: `Sahiplik aktarma işleminde birden fazla üye belirtemezsin.`, ephemeral: true })
        return
      }

      await datas.updateOne({ Owner: interaction.user.id }, { $set: { Owner: members[0].user.id } }, { upsert: true });
      interaction.followUp({ content: `${members.map((member, idx) => `${member.toString()}`).join(", ")} üyesini yeni kanal sahibi olarak belirlediniz.`, ephemeral: true });
    })
  } else if (interaction.customId === "pompalamasyon10") {
    if (!room) {
      await interaction.reply({ content: `Kanal sahibi olmadığınız için bu butonu kullanamazsınız.`, ephemeral: true })
      if (Guild.channels.cache.get(room?.ID) && Guild.channels.cache.get(room?.ID)?.deletable) Guild.channels.cache.get(room?.ID)?.delete("Oda sahibi tarafından silindi.");
      return
    }
    await datas.deleteMany({ Owner: interaction.user.id });
    interaction.reply({ content: `🗑️ <@${interaction.user.id}> **${room?.Name ?? "Bilinmeyen Oda"}** isimli oda başarılı bir şekilde silindi.`, ephemeral: true })
    if (Guild.channels.cache.get(room?.ID) && Guild.channels.cache.get(room?.ID)?.deletable) Guild.channels.cache.get(room?.ID)?.delete("Oda sahibi tarafından silindi.");
  }
});


client.on("interactionCreate", async (modal) => {
  if (!modal.isModalSubmit()) return;
  const Guild = client.guilds.cache.get("1260644514968764438");
  const room = await datas.findOne({ Owner: modal.user.id });

  if (modal.customId === "createroom") {
    const roomName = modal.fields.getTextInputValue("name")
    const roomLimit = modal.fields.getTextInputValue("limit")
    if (isNaN(roomLimit)) return;

    let newChannel = await Guild.channels.create({
      name: `💎┃${roomName}`,
      type: ChannelType.GuildVoice,
      userLimit: roomLimit > 99 ? 99 : roomLimit,
      parent: "1307885733251645542",
      permissionOverwrites: [{
        id: "1260644514968764438",
        deny: [PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.SendMessages],
      },
      {
        id: modal.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.SendMessages],
      }
      ]
    }).then(async (c) => {
      new datas({
        ID: c.id,
        Owner: modal.user.id,
        Name: `💎┃${roomName}`,
        Users: [],
        Duration: 0,
        LastJoin: Date.now(),
        MaxUser: roomLimit > 99 ? 99 : roomLimit
      }).save()

      await datas.updateOne(
        { Owner: modal.user.id },
        { $set: { ID: c.id } },
        { upsert: true }
      );
      let row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pompalamasyon1")
          .setLabel("Kanalı Kilitle")
          .setEmoji(`1213643978902212648`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon2")
          .setEmoji(`1213644006018523146`)
          .setLabel("Kilidi Aç")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon3")
          .setEmoji(`1213644035990749194`)
          .setLabel("Odanı Gizle")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon4")
          .setEmoji(`1213644055221637140`)
          .setLabel("Gizlemeyi Kaldır")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon5")
          .setEmoji(`1213644083176677427`)
          .setLabel("Sahiplik İste")
          .setStyle(ButtonStyle.Secondary),
      );
      let row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pompalamasyon6")
          .setEmoji(`1213644108451553290`)
          .setLabel("Üye Ekle")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon7")
          .setEmoji(`1213644127376511016`)
          .setLabel("Üye Kaldır")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon8")
          .setEmoji(`1213644147634868288`)
          .setLabel("Kanalı Düzenle")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon9")
          .setEmoji(`1213644165192360006`)
          .setLabel("Sahipliğini Aktar")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pompalamasyon10")
          .setEmoji(`1213644192354406471`)
          .setLabel("Odanı Sil")
          .setStyle(ButtonStyle.Secondary),
      );

      const invite = await c.createInvite({ maxUses: 100 });

      const embed = new EmbedBuilder()
      .setTitle("Özel Oda Yönetim Paneli")
      .setColor('#2e3035')
      .setImage("https://i.imgur.com/yJzHsO7.jpeg")
      client.channels.cache.get(c.id).send({ content: `<@${modal.user.id}>`, embeds: [embed], components: [row2, row3] })
    })
  } else if (modal.customId === "edit2") {
    const room = await datas.findOne({ Owner: modal.user.id });
    const name = modal.fields.getTextInputValue("name");
    const limit = modal.fields.getTextInputValue("limit");
    if (isNaN(limit)) return;

    modal.reply({
      content: `✏️ <@${modal.user.id}> Odanız başarılı bir şekilde yeniden düzenlendi.\n
            \` ➥ \` Oda İsmi: ${name}
            \` ➥ \` Oda Limiti: ${limit}
            `, ephemeral: true
    })

    if (Guild?.channels?.cache.get(room?.ID) && Guild?.channels?.cache.get(room?.ID)?.manageable) {
      if (name !== (room?.Name)) {
        await datas.findOneAndUpdate({ Owner: modal.user.id }, { $set: { Name: name } }, { upsert: true });
        await Guild?.channels?.cache.get(room?.ID)?.setName(name, "Oda sahibi, oda ismini değiştirdi.");
      }
      if (limit !== (room?.Limit)) {
        await datas.findOneAndUpdate({ Owner: modal.user.id }, { $set: { MaxUser: limit > 99 ? 99 : limit } }, { upsert: true });
        await Guild?.channels?.cache.get(room?.ID)?.setUserLimit(limit, "Oda sahibi, oda limitini değiştirdi.");
      }
    }
  }
})