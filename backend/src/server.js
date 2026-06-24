const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const bedRoutes = require("./routes/bedRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const connectDB = require("./config/db");
const { removeDummyHospitals, normalizeAllHospitalBeds } = require("./utils/hospitalSync");

dotenv.config();

connectDB().then(async () => {
  await removeDummyHospitals();
  await normalizeAllHospitalBeds();
});

const app = express();

app.use(
  cors({
    origin: [
      "https://pulse-point-liart.vercel.app",
      "https://pusle-point.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Pulse Point Hospital API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/emergency", emergencyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
