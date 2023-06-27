const mongoose = require('mongoose');

const Rooms = new mongoose.Schema({
  room_no: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true},
  alloted: { type: Number, default: 0}
},{
  collection: 'rooms'
});

const rooms = mongoose.model('rooms', Rooms);

module.exports = rooms;