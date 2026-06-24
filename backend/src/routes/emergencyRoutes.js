const express = require("express");
const { dispatchAmbulance } = require("../controllers/emergencyController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/dispatch", protect, authorize("patient"), dispatchAmbulance);

module.exports = router;
