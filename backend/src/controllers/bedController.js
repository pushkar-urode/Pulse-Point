const BedBooking = require("../models/BedBooking");
const Hospital = require("../models/Hospital");

const bookBed = async (req, res) => {
  try {
    const { hospitalId, date } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.availableBeds <= 0) {
      return res.status(400).json({ message: "No beds available" });
    }

    hospital.availableBeds -= 1;
    await hospital.save();

    const booking = await BedBooking.create({
      patient: req.user.id,
      hospital: hospitalId,
      date,
    });

    const populated = await BedBooking.findById(booking._id)
      .populate("hospital", "name city address availableBeds totalBeds")
      .populate("patient", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientBookings = async (req, res) => {
  try {
    const bookings = await BedBooking.find({
      patient: req.user.id,
      status: "confirmed",
    })
      .populate("hospital", "name city address availableBeds totalBeds")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookBed, getPatientBookings };
