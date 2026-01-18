const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LiveKitSchema = new Schema({
  secret: { type: String },
  url: { type: String },
  key: { type: String },
});

module.exports = LiveKit = mongoose.model("LiveKit", LiveKitSchema);
