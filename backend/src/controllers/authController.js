const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialty,
      hospital,
      latitude,
      longitude,
    } = req.body;

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "doctor" && (!specialty || !hospital)) {
      return res.status(400).json({
        message: "Doctors must select a specialty and hospital",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      specialty: role === "doctor" ? specialty : undefined,
      hospital: role === "doctor" ? hospital : undefined,
      latitude,
      longitude,
    });

    const populated = await User.findById(user._id).populate("hospital", "name city");

    res.status(201).json({
      message: "Registration successful",
      user: populated.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).populate("hospital", "name city");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(400).json({
        message: `Please use the ${user.role} login page`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
