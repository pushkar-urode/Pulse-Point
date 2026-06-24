const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { SPECIALTIES } = require("../models/User");

const getDoctors = async (req, res) => {
  try {
    const filter = { role: "doctor" };
    if (req.query.specialty) {
      filter.specialty = req.query.specialty;
    }
    if (req.query.hospital) {
      filter.hospital = req.query.hospital;
    }

    const doctors = await User.find(filter)
      .select("-password")
      .populate("hospital", "name city address");

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSpecialties = async (_req, res) => {
  res.json(SPECIALTIES);
};

const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    const doctor = await User.findById(doctorId).populate("hospital");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      hospital: doctor.hospital._id,
      specialty: doctor.specialty,
      date,
      timeSlot,
      reason: reason || "",
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("doctor", "name specialty email")
      .populate("hospital", "name city address")
      .populate("patient", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialty email")
      .populate("hospital", "name city address")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email")
      .populate("hospital", "name city")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    appointment.status = status;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email")
      .populate("hospital", "name city");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getSpecialties,
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
