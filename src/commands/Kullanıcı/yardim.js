const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, Emoji } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "yardım",
  usage: "yardım",
  aliases: [],
  execute: async (client, message, args, embed) => {
    // Komutlar dizinine erişim
    const commandsPath = path.join(__dirname, "../../commands");
    const categories = fs.readdirSync(commandsPath).filter(folder => fs.statSync(path.join(commandsPath, folder)).isDirectory());

    // Kategorileri Select Menüye ekle
    const categoryOptions = categories.map(category => ({
      label: `${category} Komutları`,
      value: category,
      emoji: "1314627088824930375"
    }));

    // Eğer kategori yoksa
    if (categoryOptions.length === 0) {
      return message.channel.send({ content: "Hiç kategori bulunamadı!", ephemeral: true });
    }

    // Select Menü oluştur
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("yardim_kategori")
        .setPlaceholder("Bir kategori seçmek için tıklayın")
        .addOptions(categoryOptions)
    );

    // Yardım menüsünü gönder
    await message.channel.send({
      content: "Komutlar kategorilere ayrılmıştır. Bir kategori seçin:",
      components: [row],
    });
  },
};

client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "yardim_kategori") {
      const selectedCategory = interaction.values[0];  // Seçilen kategori
      const commandsPath = path.join(__dirname, "../../commands", selectedCategory);
  
      // Komutları kategoriye göre al
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
      const commandOptions = commandFiles.map(file => {
        const command = require(path.join(commandsPath, file));
        return {
          label: command.name,
          emoji: "1314319453886091344",
          value: command.name,
        };
      });
  
      // Eğer komut yoksa
      if (commandOptions.length === 0) {
        return interaction.reply({ content: "Bu kategoride komut bulunamadı.", ephemeral: true });
      }
  
      // Komut seçimi için Select Menü oluştur
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("yardim_komut")
          .setPlaceholder("Bir komut seçmek için tıklayın")
          .addOptions(commandOptions)
      );
  
      // Komut seçimi menüsünü gönder
      await interaction.reply({
        content: `${selectedCategory} kategorisinde bulunan komutlar. Bir komut seçin:`,
        components: [row],
        ephemeral: true,
      });
    }
  
    // Komut seçimi yapıldıktan sonra komut detaylarını göster
    if (interaction.customId === "yardim_komut") {
      const selectedCommand = client.commands.get(interaction.values[0]);
      if (selectedCommand) {
        await interaction.reply({
          content: `**Komut Adı:** \`${selectedCommand.name}\`\n**Açıklama:** ${selectedCommand.usage || "Kullanım bilgisi yok"}\n**Kısayollar:** ${selectedCommand.aliases.join(", ") || "Yok"}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({ content: "Komut bulunamadı!", ephemeral: true });
      }
    }
  }
  
})