const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    shield: String,
    name: String,
    location: String,
    author: { type: Schema.ObjectId, ref: "User" },
    size: Number,
    shieldedID: String,
    type: String,
});

module.exports = mongoose.model("files", FileSchema);
