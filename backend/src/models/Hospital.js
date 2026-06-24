const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    osmId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    totalBeds: { type: Number, required: true, default: 50 },
    availableBeds: { type: Number, required: true, default: 20 },
    phone: { type: String },
    website: { type: String },
    emergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
