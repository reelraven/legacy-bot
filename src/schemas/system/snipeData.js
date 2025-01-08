const mongoose = require("mongoose");
const newUserDB = mongoose.Schema({
  guildID: String,
  userID: String,
  channelID: String,
  deletedTime: Number,
  createdTime: Number,
  messageContent: String,
  Image: String
});

module.exports = mongoose.model("snipeDB", newUserDB);