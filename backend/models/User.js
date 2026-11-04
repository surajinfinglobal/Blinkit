const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, 'Phone number zaroori hai!'],
      unique: true,
      trim: true,
    },

    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // User schema mein
    favorites: [{ type: String }],  // Array of product IDs

    addresses: [
      {
        label: String, 
        houseNo: String,
        floor: String,
        area: String,
        landmark: String,
        city: String,
        pincode: String,
        lat: Number,
        lng: Number,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)