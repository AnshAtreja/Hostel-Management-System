const mongoose = require('mongoose');

const Student = new mongoose.Schema({
    name: { type: String, required: true },
    roll_no: { type: Number, required: true, unique: true },
    branch: { type: String, required: true },
    room_no: { type: Number, required: true },
},{
  collection: 'student'
});

const student = mongoose.model('student', Student);

module.exports = student;