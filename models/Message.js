const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: { type: Schema.ObjectId, ref: "User" },
    content: String,
    type: String,
    file: { type: Schema.ObjectId, ref: "files" },
    room: { type: Schema.ObjectId, ref: "rooms" },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("messages", MessageSchema);
