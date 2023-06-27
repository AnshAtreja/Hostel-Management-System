const mongoose = require('mongoose');

const Hostel = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  name: { type: String, required: true },
    roll_no: { type: Number, required: true, unique: true },
    branch: { type: String, required: true },
    room_no: { type: Number, required: true },
},{
  collection: 'hostellers'
});

const hostel = mongoose.model('hostel', Hostel);

module.exports = hostel;
