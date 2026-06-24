const Hospital = require("../models/Hospital");
const { getDistanceKm } = require("../utils/distance");
const { syncHospitalsFromOSM } = require("../utils/hospitalSync");
const { fetchRoadRoute, buildStraightRoute } = require("../utils/fetchRoadRoute");

const dispatchAmbulance = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Your location is required for emergency dispatch." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid location coordinates." });
    }

    await syncHospitalsFromOSM(latitude, longitude, 30000);

    const hospitals = await Hospital.find({ osmId: { $exists: true, $ne: null } });
    let nearest = null;
    let minDistance = Infinity;

    for (const hospital of hospitals) {
      const distanceKm = getDistanceKm(
        latitude,
        longitude,
        hospital.latitude,
        hospital.longitude
      );
      if (distanceKm < minDistance) {
        minDistance = distanceKm;
        nearest = hospital;
      }
    }

    if (!nearest) {
      return res.status(404).json({ message: "No hospital found nearby to dispatch an ambulance." });
    }

    let route;
    let distanceKm = Number(minDistance.toFixed(2));
    let etaMinutes = Math.max(3, Math.ceil((minDistance / 45) * 60));
    let followsRoads = false;

    try {
      const roadRoute = await fetchRoadRoute(
        nearest.latitude,
        nearest.longitude,
        latitude,
        longitude
      );
      route = roadRoute.route;
      distanceKm = roadRoute.distanceKm;
      etaMinutes = roadRoute.etaMinutes;
      followsRoads = true;
    } catch {
      route = buildStraightRoute(
        nearest.latitude,
        nearest.longitude,
        latitude,
        longitude,
        40
      );
    }

    res.json({
      ambulanceId: `AMB-${Date.now().toString(36).toUpperCase()}`,
      hospital: {
        _id: nearest._id,
        name: nearest.name,
        address: nearest.address,
        city: nearest.city,
        latitude: nearest.latitude,
        longitude: nearest.longitude,
        phone: nearest.phone,
      },
      patientLocation: { lat: latitude, lng: longitude },
      distanceKm,
      etaMinutes,
      route,
      followsRoads,
      status: "dispatched",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { dispatchAmbulance };
