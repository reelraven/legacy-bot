const client = global.client;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType } = require("discord.js");
const config = require("../../config");
const ms = require('ms');
const db = require("quick.db")
const canvafy = require("canvafy");
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = async (message) => {
    if (config.prefix && !message.content.startsWith(config.prefix))return;
    const args = message.content.slice(1).trim().split(/ +/g);
    const commands = args.shift().toLowerCase();
    const cmd = client.commands.get(commands) || [...client.commands.values()].find((e) => e.aliases && e.aliases.includes(commands));
    const embed = new EmbedBuilder()
    .setColor(`#2f3136`)

    if (cmd) {
      
        cmd.execute(client, message, args, embed);
    }

    
  }

  
  


module.exports.conf = { 
name: "messageCreate"
}