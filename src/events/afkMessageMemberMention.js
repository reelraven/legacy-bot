const client = global.client;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType } = require("discord.js");
const config = require("../../config");
const ms = require('ms');
const afkdb = require("../schemas/system/afk.js")
module.exports = async (message) => {
const afksystem = await afkdb.findOne({guildID:message.guild.id,userID:message.author.id});
const only = afksystem ? afksystem.only : false
if(only == true){
message.channel.send({content:`Hoşgeldin!, <t:${(afksystem.date/1000).toFixed()}:R> **AFK** moduna girmiştin.`}).then(async msg => {setTimeout(async() => {if(msg) await msg.delete();},5000);})
await afkdb.findOneAndDelete({guildID:message.guild.id,userID:message.member.id});
}
}

module.exports.conf = { 
name: "messageCreate"
}