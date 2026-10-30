const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header se token lo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is required.',
      });
    }

    const token = authHeader.split(' ')[1];

    // JWT token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database mein user check karo
    const user = await User.findById(decoded.userId).select(
      '_id name phone'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.',
      });
    }

    req.user = user;

    // Agle middleware ya route par jao
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

module.exports = authMiddleware;