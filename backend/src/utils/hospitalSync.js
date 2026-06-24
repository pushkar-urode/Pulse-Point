const Hospital = require("../models/Hospital");
const {
  fetchRealHospitals,
  normalizeTotalBeds,
  estimateAvailableBeds,
  MIN_TOTAL_BEDS,
} = require("./fetchRealHospitals");

const syncHospitalsFromOSM = async (lat, lng, radiusM = 20000) => {
  const osmHospitals = await fetchRealHospitals(lat, lng, radiusM);
  const synced = [];

  for (const h of osmHospitals) {
    const existing = await Hospital.findOne({ osmId: h.osmId });
    const normalizedTotal = normalizeTotalBeds(h.totalBeds, h.osmId);

    if (existing) {
      existing.name = h.name;
      existing.address = h.address;
      existing.city = h.city;
      existing.latitude = h.latitude;
      existing.longitude = h.longitude;
      if (h.phone) existing.phone = h.phone;
      if (h.website) existing.website = h.website;
      existing.emergency = h.emergency;

      if (existing.totalBeds < MIN_TOTAL_BEDS) {
        existing.totalBeds = normalizedTotal;
        if (existing.availableBeds > existing.totalBeds) {
          existing.availableBeds = estimateAvailableBeds(existing.totalBeds, h.osmId);
        }
      }

      await existing.save();
      synced.push(existing);
    } else {
      const totalBeds = normalizedTotal;
      const availableBeds = estimateAvailableBeds(totalBeds, h.osmId);
      const created = await Hospital.create({
        ...h,
        totalBeds,
        availableBeds,
      });
      synced.push(created);
    }
  }

  return synced;
};

const normalizeAllHospitalBeds = async () => {
  const hospitals = await Hospital.find({ totalBeds: { $lt: MIN_TOTAL_BEDS } });
  for (const h of hospitals) {
    const normalized = normalizeTotalBeds(h.totalBeds, h.osmId || h._id.toString());
    h.totalBeds = normalized;
    if (h.availableBeds > h.totalBeds || h.availableBeds <= 1) {
      h.availableBeds = estimateAvailableBeds(h.totalBeds, h.osmId || h._id.toString());
    }
    await h.save();
  }
  if (hospitals.length > 0) {
    console.log(`Normalized bed capacity for ${hospitals.length} hospital(s)`);
  }
};

const removeDummyHospitals = async () => {
  const result = await Hospital.deleteMany({
    $or: [{ osmId: { $exists: false } }, { osmId: null }],
  });
  if (result.deletedCount > 0) {
    console.log(`Removed ${result.deletedCount} dummy hospital(s)`);
  }
};

module.exports = { syncHospitalsFromOSM, removeDummyHospitals, normalizeAllHospitalBeds };
