const Rider = require("../models/Rider");

exports.getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find({ isActive: { $ne: false } }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Riders fetch karne mein error aaya",
      error: error.message,
    });
  }
};