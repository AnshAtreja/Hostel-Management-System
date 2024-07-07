const mongoose = require('mongoose');

const Chng = new mongoose.Schema({
  host: { type: String, required: true},
  prev_room: { type: Number, required: true},
  new_room: { type: Number, required: true}
},{
  collection: 'chng'
});

const chng = mongoose.model('chng', Chng);

module.exports = chng;