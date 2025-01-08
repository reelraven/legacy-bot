
const { EmbedBuilder } = require("discord.js");
const snipeData = require("../schemas/system/snipeData")
const moment = require('moment');

module.exports = async(message) => {
  
 if (message.channel.type === "dm" || !message.guild || message.author.bot) return;
    let RData = await snipeData.findOne({ guildID: message.guild.id })
    if(!RData) {
        let newData = new snipeData({
            guildID: message.guild.id,
            userID: message.author.id,
            channelID: message.channel.id,
            deletedTime: Date.now(),
            createdTime: message.createdTimestamp,
            messageContent: message.content,
            Image: message.attachments.first() ? message.attachments.first().proxyURL : null
    
        }).save().catch(e => { }) 
    
    } else {
        RData.userID = message.author.id; 
        RData.channelID = message.channel.id;
        RData.deletedTime= Date.now(),
        RData.createdTime= message.createdTimestamp,
        RData.messageContent= message.content,
        RData.Image = message.attachments.first() ? message.attachments.first().proxyURL : null
        RData.save().catch(e => { })
    }
}
module.exports.conf = {
name: "messageDelete"
}