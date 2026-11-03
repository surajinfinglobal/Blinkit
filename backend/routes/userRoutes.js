const express = require('express')
const router = express.Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const { protectAdmin } = require('../middleware/adminAuthMiddleware')

// Protected profile API
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('_id name phone addresses')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user,
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Profile fetch nahi ho paya',
    })
  }
})

module.exports = router

// Admin: Get all users
router.get('/all', protectAdmin, async (req, res) => {
  try {
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
