const express = require("express");
const { bookBed, getPatientBookings } = require("../controllers/bedController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), bookBed);
router.get("/my", protect, authorize("patient"), getPatientBookings);

module.exports = router;
