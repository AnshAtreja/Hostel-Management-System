const mongoose = require("mongoose");

const Hosteleller = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    roll_no: { type: Number, required: true, unique: true },
    branch: { type: String, required: true },
    room_no: { type: Number, required: true },
    hm_apply: { type: Boolean, default: false },
    hm_apprv: { type: Boolean, default: false },
  },
  {
    collection: "hostellers",
  }
);

const hosteller = mongoose.model("hosteller", Hosteleller);

module.exports = hosteller;
