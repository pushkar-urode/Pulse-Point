const Hospital = require("../models/Hospital");
const { getDistanceKm } = require("../utils/distance");
const { syncHospitalsFromOSM } = require("../utils/hospitalSync");

const getHospitals = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Location required. Pass lat and lng to find real nearby hospitals.",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusM = parseInt(radius, 10) || 20000;

    await syncHospitalsFromOSM(latitude, longitude, radiusM);

    const hospitals = await Hospital.find({ osmId: { $exists: true, $ne: null } });

    const withDistance = hospitals
      .map((h) => {
        const data = h.toObject();
        data.distanceKm = getDistanceKm(
          latitude,
          longitude,
          h.latitude,
          h.longitude
        );
        return data;
      })
      .filter((h) => h.distanceKm <= radiusM / 1000)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 30);

    res.json(withDistance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBedAvailability = async (req, res) => {
  try {
    const { availableBeds, totalBeds } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (req.user.hospital !== hospital._id.toString()) {
      return res.status(403).json({
        message: "You can only update beds at your assigned hospital",
      });
    }

    if (totalBeds !== undefined) {
      const parsedTotal = parseInt(totalBeds, 10);
      if (Number.isNaN(parsedTotal) || parsedTotal < 10 || parsedTotal > 1000) {
        return res.status(400).json({
          message: "Total bed capacity must be between 10 and 1000",
        });
      }
      hospital.totalBeds = parsedTotal;
    }

    if (availableBeds === undefined) {
      return res.status(400).json({ message: "Available beds is required" });
    }

    const parsedAvailable = parseInt(availableBeds, 10);
    if (
      Number.isNaN(parsedAvailable) ||
      parsedAvailable < 0 ||
      parsedAvailable > hospital.totalBeds
    ) {
      return res.status(400).json({
        message: `Available beds must be between 0 and ${hospital.totalBeds}`,
      });
    }

    hospital.availableBeds = parsedAvailable;
    await hospital.save();

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHospitals, getHospital, updateBedAvailability };
