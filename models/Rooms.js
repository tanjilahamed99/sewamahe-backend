const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    people: [{ type: Schema.ObjectId, ref: "User" }],
    title: String,
    picture: { type: Schema.ObjectId, ref: "images" },
    isGroup: { type: Boolean, default: false },
    lastUpdate: Date,
    lastAuthor: { type: Schema.ObjectId, ref: "User" },
    lastMessage: { type: Schema.ObjectId, ref: "messages" },
});

module.exports = mongoose.model("rooms", RoomSchema);
