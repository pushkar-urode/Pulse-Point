const mongoose = require("mongoose");

const SPECIALTIES = [
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedist",
  "Dermatologist",
  "General Physician",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    specialty: {
      type: String,
      enum: SPECIALTIES,
      required: function () {
        return this.role === "doctor";
      },
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: function () {
        return this.role === "doctor";
      },
    },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
  const hospitalId = this.hospital?._id || this.hospital;
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    specialty: this.specialty,
    hospital: hospitalId ? hospitalId.toString() : undefined,
    latitude: this.latitude,
    longitude: this.longitude,
  };
};

module.exports = mongoose.model("User", userSchema);
module.exports.SPECIALTIES = SPECIALTIES;
