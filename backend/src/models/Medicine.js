const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "units" },
    minStock: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
