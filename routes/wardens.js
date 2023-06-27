const mongoose = require('mongoose');

const Warden = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  name: {type: String}
},{
  collection: 'wardens'
});

const warden = mongoose.model('warden', Warden);

module.exports = warden;
