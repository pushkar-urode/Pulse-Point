const express = require("express");
const {
  searchMedicines,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/search", protect, authorize("patient"), searchMedicines);
router.get("/", protect, authorize("doctor"), getMedicines);
router.post("/", protect, authorize("doctor"), addMedicine);
router.put("/:id", protect, authorize("doctor"), updateMedicine);
router.delete("/:id", protect, authorize("doctor"), deleteMedicine);

module.exports = router;
