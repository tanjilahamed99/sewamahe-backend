const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RazorPaySchema = new Schema({
  key: { type: String },
  secret: { type: String },
  razorpayId: { type: String },
});

module.exports = RazorPay = mongoose.model('RazorPay', RazorPaySchema);
