const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { protectAdmin } = require('../middleware/adminAuthMiddleware')

// Protected profile API
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: req.user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

module.exports = router

// Admin: Get all users
router.get('/all', protectAdmin, async (req, res) => {
  try {
    const User = require('../models/User')
    const users = await User.find().select('-otp -otpExpires -password')
    return res.status(200).json({
      success: true,
      users: users,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})
