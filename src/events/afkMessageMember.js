const client = global.client;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType } = require("discord.js");
const config = require("../../config");
const ms = require('ms');
const afkdb = require("../schemas/system/afk.js")
module.exports = async (message) => {
  
const member = message.mentions.members.first()
if(!member) return;
const afksystem = await afkdb.findOne({guildID:message.guild.id,userID:member.id});
const only = afksystem ? afksystem.only : false
if(only == true){
message.channel.send({embeds:[new EmbedBuilder().setAuthor({name:message.guild.name,iconURL:message.guild.iconURL({dynamic:true})}).setDescription(`${member}, <t:${(afksystem.date/1000).toFixed()}:R> "__${afksystem.reason}__" sebebiyle **AFK** moduna girmişti!`)]}).then(async msg => {setTimeout(async() => {if(msg) await msg.delete();},10000);})
}
}

module.exports.conf = { 
name: "messageCreate"
}