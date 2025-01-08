const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "düello",
    description: "Bir kullanıcıyla düello yap!",
    aliases: ["savas"],
    execute: async (client, message, args) => {
        const player1 = message.author;
        let player2;

        if (args[0] && args[0].toLowerCase() === "@ravendadşalisda") {
            player2 = client.user; // Eğer bot ile düello yapılacaksa, bot rakip olarak kendini alacak
        } else {
            player2 = message.mentions.users.first();
            if (!player2 || player2.bot) {
                return message.reply("Lütfen bir kullanıcı etiketleyin. Örn: `!düello @kullanıcı`");
            }
        }

        const gameEmbed = new EmbedBuilder()
        .setTitle("🪨 Taş, Kağıt, Makas!")
        .setDescription(
            `${player1} ve ${player2}, düelloya başlamadan önce sırayı belirlemek için taş-kağıt-makas oynayacaksınız!`
        )
        .setColor("DarkBlue");

    const rockButton = new ButtonBuilder()
        .setCustomId('tas')
        .setLabel('🪨 Taş')
        .setStyle(ButtonStyle.Primary);

    const paperButton = new ButtonBuilder()
        .setCustomId('kagıt')
        .setLabel('📄 Kağıt')
        .setStyle(ButtonStyle.Primary);

    const scissorsButton = new ButtonBuilder()
        .setCustomId('makas')
        .setLabel('✂️ Makas')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(rockButton, paperButton, scissorsButton);

    const gameMessage = await message.channel.send({
        embeds: [gameEmbed],
        components: [row]
    });

    const moves = {};
    
    const filter = (interaction) => interaction.user.id === player1.id || interaction.user.id === player2.id;
    const collector = gameMessage.createMessageComponentCollector({ filter, max: 2, time: 30000 });

    collector.on('collect', async (interaction) => {
        const choice = interaction.customId;
        moves[interaction.user.id] = choice;
        await interaction.reply({ content: `Seçiminiz: **${choice.toUpperCase()}**`, ephemeral: true });
        
        if (Object.keys(moves).length === 2) {
            gameMessage.edit({content: "."}) // 1 saniye (1000 ms) bekle ve mesajı sil
            setTimeout(async () => {
              await gameMessage.delete().catch(console.error);
            }, 1000);
            collector.stop();
        }
    });

    collector.on('end', async () => {
        if (Object.keys(moves).length < 2) {
            return gameMessage.edit({
                content: "⏳ Süre doldu! Her iki oyuncu da seçim yapmadı.",
                components: []
            });
        }

        const result = determineWinner(player1, player2, moves);
        const winner = result.winner;
        const loser = result.loser;

             


        startDuel(winner, loser); // Düelloyu başlat
    });

    function determineWinner(player1, player2, moves) {
        const outcomes = {
            rock: { scissors: true, paper: false },
            paper: { rock: true, scissors: false },
            scissors: { paper: true, rock: false }
        };

        const p1Move = moves[player1.id];
        const p2Move = moves[player2.id];

        if (p1Move === p2Move) {
            const randomWinner = Math.random() > 0.5 ? player1 : player2; // %50 ihtimalle rastgele kazanan seç
            return { winner: randomWinner, loser: randomWinner === player1 ? player2 : player1 };
        }

        const p1Wins = outcomes[p1Move][p2Move];
        return p1Wins
            ? { winner: player1, loser: player2 }
            : { winner: player2, loser: player1 };
    }

        // Düelloyu başlatma fonksiyonu
       async function startDuel(winner, loser) {
            const stats = {
                [player1.id]: { health: 100, mana: 75, healthPotions: 3, manaPotions: 2, defending: false, shield: false },
                [player2.id]: { health: 100, mana: 75, healthPotions: 3, manaPotions: 2, defending: false, shield: false },
            };

            let currentPlayer = player1.id;
            const actionResponses = [];
        
            const generateBar = (value) => {
                if (value < 0) value = 0;
                const full = Math.floor(value / 10);
                const empty = 10 - full;
                return '▰'.repeat(full) + '▱'.repeat(empty);
            };

            const embed = new EmbedBuilder()
                .setTitle("⚔️ Düello Başladı!")
                .setColor("DarkRed")
                .setDescription(`${player1} ve ${player2} arasında düello başladı!`);

            const updateEmbed = () => {
                embed.setFields(
                    {
                        name: `<:wizard1:1318909008962392094> ${player1.username}`,
                        value: `❤️ Can: ${generateBar(stats[player1.id].health)} (${stats[player1.id].health}%)\n` +
                            `<:manaa:1318891088097841182> Mana: ${generateBar(stats[player1.id].mana)} (${stats[player1.id].mana}%)\n` +
                            `<:caniksir:1318889556958777386> Can İksiri: x${stats[player1.id].healthPotions}\n<:mana:1318888937409871926> Mana İksiri: x${stats[player1.id].manaPotions}`,
                        inline: true
                    },
                    {
                        name: `<:wizard2:1318909004843585536> ${player2.username}`,
                        value: `❤️ Can: ${generateBar(stats[player2.id].health)} (${stats[player2.id].health}%)\n` +
                            `<:manaa:1318891088097841182> Mana: ${generateBar(stats[player2.id].mana)} (${stats[player2.id].mana}%)\n` +
                            `<:caniksir:1318889556958777386> Can İksiri: x${stats[player2.id].healthPotions}\n<:mana:1318888937409871926> Mana İksiri: x${stats[player2.id].manaPotions}`,
                        inline: true
                    }
                );
                const lastActions = actionResponses.slice(-5).join("\n");
                embed.addFields({
                    name: "Son 5 Hareket",
                    value: lastActions || "Henüz bir hareket yapılmadı."
                });
            };

            updateEmbed();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('attack').setLabel('Saldır').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('defense').setLabel('Savunma').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ultraguc').setLabel('Ultra Güç').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('potion').setLabel('Can İksiri').setStyle(ButtonStyle.Secondary),
            );

            const action2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('mana').setLabel('Mana İksiri').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('shield').setLabel('Zırh Kalkanı').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('quit').setLabel('Pes Et').setStyle(ButtonStyle.Danger)
            );

            const duelMessage = await message.channel.send({ embeds: [embed], components: [actionRow, action2] });

            const filter = (interaction) => interaction.isButton(); // Buton etkileşimleri
            const duelCollector = duelMessage.createMessageComponentCollector({ filter, time: 10 * 60 * 1000 });


            duelCollector.on('collect', async (interaction) => {
                if (interaction.user.id !== currentPlayer) {
                    return interaction.reply({ content: `❗ Sıra **${currentPlayer === player1.id ? player1.username : player2.username}**'de!`, ephemeral: true });
                }

                const action = interaction.customId;
                const opponent = currentPlayer === player1.id ? player2 : player1;
                let validMove = true;

                stats[currentPlayer].defending = false;
            

                // Botun veya oyuncunun hareketine göre mantık:
                if (interaction.customId === 'attack') {
                    const damage = Math.floor(Math.random() * 20) + 10;
                    const finalDamage = stats[opponent.id].shield ? Math.floor(damage / 2) : damage;
                    stats[opponent.id].health = Math.max(0, stats[opponent.id].health - finalDamage);
                    actionResponse = `💥 **${interaction.user.username}**, **${finalDamage}** hasar verdi!`;

                } else if (interaction.customId === 'defense') {
                    stats[currentPlayer].defending = true;
                    stats[currentPlayer].health += 10;
                    actionResponse = `🛡️ **${interaction.user.username}**, savunmaya geçti ve **10** can kazandı!`;

                } else if (interaction.customId === 'ultraguc') {
                    if (stats[currentPlayer].mana >= 40) {
                        const ultraDamage = Math.floor(Math.random() * 60) + 20;
                        stats[opponent.id].health = Math.max(0, stats[opponent.id].health - ultraDamage);
                        stats[currentPlayer].mana -= 40;
                        actionResponse = `⚡ **${interaction.user.username}**, ultra güç kullandı ve **${ultraDamage}** hasar verdi!`;
                    } else {
                        validMove = false;
                        actionResponse = "❗ Yeterli mananız yok! Sıra sizde.";
                    }

                } else if (interaction.customId === 'potion') {
                    if (stats[currentPlayer].healthPotions > 0) {
                        stats[currentPlayer].health = Math.min(100, stats[currentPlayer].health + 20);
                        stats[currentPlayer].healthPotions -= 1;
                        actionResponse = `🧪 **${interaction.user.username}**, can iksiri kullandı ve **20** can kazandı!`;
                    } else {
                        validMove = false;
                        actionResponse = "❗ Can iksiriniz kalmadı! Sıra sizde.";
                    }

                } else if (interaction.customId === 'mana') {
                    if (stats[currentPlayer].manaPotions > 0) {
                        stats[currentPlayer].mana = Math.min(100, stats[currentPlayer].mana + 25);
                        stats[currentPlayer].manaPotions -= 1;
                        actionResponse = `🔹 **${interaction.user.username}**, mana iksiri kullandı ve **25** mana kazandı!`;
                    } else {
                        validMove = false;
                        actionResponse = "❗ Mana iksiriniz kalmadı! Sıra sizde.";
                    }

                } else if (interaction.customId === 'shield') {
                    stats[currentPlayer].shield = true;
                    actionResponse = `🛡️ **${interaction.user.username}**, zırh kalkanı kullandı ve savunma gücünü artırdı!`;

                } else if (interaction.customId === 'quit') {
                    actionResponse = `🏳️ **${interaction.user.username}**, pes etti!\n-----------------\n<@${opponent.id}> düelloyu kazandın!
-----------------`
                    actionResponses.push(actionResponse);
                    updateEmbed();
                    duelCollector.stop();
                    await interaction.update({ embeds: [embed], components: [] });
                    return;
                }

                if (!validMove) {
                    actionResponses.push(actionResponse);
                    updateEmbed();
                    return interaction.update({ embeds: [embed], components: [actionRow, action2] });
                }

                actionResponses.push(actionResponse);
                if (stats[opponent.id].health <= 0) {
                    const victoryMessage = `-----------------\n🎉 <@${interaction.user.id}>, düelloyu kazandı!\n-----------------`;
                    actionResponses.push(victoryMessage);
                    updateEmbed();
                    await interaction.update({ embeds: [embed], components: [] });
                    duelCollector.stop();
                } else {
                    currentPlayer = opponent.id; // Sıra rakibe geçti
                    updateEmbed();
                    await interaction.update({ embeds: [embed], components: [actionRow, action2] });
                }
            });
        }
    }
};
