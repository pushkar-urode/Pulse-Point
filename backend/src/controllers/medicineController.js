const Medicine = require("../models/Medicine");

const searchMedicines = async (req, res) => {
  try {
    const { q, hospitalId } = req.query;
    const filter = { quantity: { $gt: 0 } };

    if (hospitalId) {
      filter.hospital = hospitalId;
    }

    if (q?.trim()) {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    const medicines = await Medicine.find(filter)
      .populate("hospital", "name city address")
      .sort({ name: 1 })
      .limit(50);

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ hospital: req.user.hospital }).sort({
      name: 1,
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const { name, quantity, unit, minStock } = req.body;

    const medicine = await Medicine.create({
      hospital: req.user.hospital,
      name,
      quantity: quantity ?? 0,
      unit: unit || "units",
      minStock: minStock ?? 10,
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.hospital.toString() !== req.user.hospital) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, quantity, unit, minStock } = req.body;
    if (name !== undefined) medicine.name = name;
    if (quantity !== undefined) medicine.quantity = quantity;
    if (unit !== undefined) medicine.unit = unit;
    if (minStock !== undefined) medicine.minStock = minStock;

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.hospital.toString() !== req.user.hospital) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await medicine.deleteOne();
    res.json({ message: "Medicine deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchMedicines,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
};
