const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
    caller: { type: Schema.ObjectId, ref: "User" },
    callee: { type: Schema.ObjectId, ref: "User" },
    type: { type: String, enum: ["audio", "video"]},
},{ timestamps: true });

module.exports = mongoose.model("meetings", MeetingSchema);
