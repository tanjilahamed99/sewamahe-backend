const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaygicSchema = new Schema({
  mid: { type: String },
  password: { type: String },
});

module.exports = Paygic = mongoose.model('Paygic', PaygicSchema);
