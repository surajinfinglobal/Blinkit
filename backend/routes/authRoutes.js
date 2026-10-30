const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const authMiddleware = require('../middleware/authMiddleware');



// Protected profile API
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim()

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: 'Valid 10-digit phone number is required',
      })
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    // OTP expires in 5 minutes
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    // Check whether user already exists
    let user = await User.findOne({ phone })

    if (user) {
      // Existing user: update only OTP fields
      user.otp = otp
      user.otpExpires = otpExpiry

      await user.save()

      console.log(`OTP generated for existing user: ${phone}`)
    } else {
      // New user: create a new user document
      user = await User.create({
        phone,
        otp,
        otpExpires: otpExpiry,
      })

      console.log(`New user created: ${phone}`)
    }

    return res.status(200).json({
      message: 'OTP generated successfully',
      phone: user.phone,
      otp,
    })
  } catch (error) {
    console.error('Send OTP Error:', error)

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Phone number already exists. Please retry.',
      })
    }

    return res.status(500).json({
      message: 'Server error',
    })
  }
})


// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim()
    const otp = String(req.body.otp || '').trim()

    if (!/^\d{10}$/.test(phone) || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({
        message: 'Valid phone number and 4-digit OTP are required',
      })
    }

    const user = await User.findOne({ phone }).select('+otp +otpExpires')

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please request OTP first.',
      })
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        message: 'OTP not found. Please request a new OTP.',
      })
    }

    // Check expiry BEFORE accepting the OTP
    if (Date.now() > new Date(user.otpExpires).getTime()) {
      user.otp = null
      user.otpExpires = null
      await user.save()

      return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP.',
      })
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP',
      })
    }

    // Clear OTP after successful verification
            user.otp = null;
        user.otpExpires = null;
        await user.save();
        // JWT token generate karo
        const token = jwt.sign(
        {
            userId: user._id.toString(),
            phone: user.phone,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        }
        );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Verify OTP Error:', error)

    return res.status(500).json({
      message: 'Server error',
    })
  }
})

module.exports = router; 