const express = require("express");
const {
  getHospitals,
  getHospital,
  updateBedAvailability,
} = require("../controllers/hospitalController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getHospitals);
router.get("/:id", getHospital);
router.patch(
  "/:id/beds",
  protect,
  authorize("doctor"),
  updateBedAvailability
);

module.exports = router;
