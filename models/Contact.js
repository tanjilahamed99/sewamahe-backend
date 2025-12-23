const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Contact = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  subject: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("Contact", Contact);
