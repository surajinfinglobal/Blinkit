const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

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