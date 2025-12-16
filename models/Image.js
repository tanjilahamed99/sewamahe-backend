const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    shield: String,
    name: String,
    location: String,
    author: { type: Schema.ObjectId, ref: "User" },
    size: Number,
    shieldedID: String,
});

module.exports = mongoose.model("images", ImageSchema);
