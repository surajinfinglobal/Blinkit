const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Rider ka naam zaroori hai"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number zaroori hai"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "in-transit", "break"],
      default: "available",
    },
    mission: {
      type: String,
      default: null,
      trim: true,
    },
    dl: {
      type: String,
      trim: true,
      default: null,
    },
    hub: {
      type: String,
      trim: true,
      default: null,
    },
    vehicle: {
      type: String,
      trim: true,
      default: null,
    },
    shift: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);