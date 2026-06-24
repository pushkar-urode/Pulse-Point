const express = require("express");
const {
  getDoctors,
  getSpecialties,
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/specialties", getSpecialties);
router.get("/doctors", getDoctors);

router.post("/", protect, authorize("patient"), createAppointment);
router.get(
  "/my",
  protect,
  authorize("patient"),
  getPatientAppointments
);
router.get(
  "/doctor",
  protect,
  authorize("doctor"),
  getDoctorAppointments
);
router.patch(
  "/:id/status",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);

module.exports = router;
