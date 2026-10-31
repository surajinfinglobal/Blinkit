// routes/address.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware'); 

router.post('/addresses', protect, async (req, res) => {
     console.log('📥 Received address:', req.body); 
  console.log('👤 User ID:', req.user?.id); 
     try {
    const { houseNo, floor, area, landmark, city, pincode } = req.body;
    if (!area || !city || !pincode) {
      return res.status(400).json({ message: 'Area, city, pincode required' });
    }
    
     // User ke document mein push karo
   const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { addresses: { houseNo, floor, area, landmark, city, pincode } } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
     // Last added address return karo (with its _id)
    const savedAddress = user.addresses[user.addresses.length - 1];
    res.status(201).json({
      message: 'Address saved successfully',
      address: savedAddress,
    });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/addresses', protect, async (req, res) => {
     try {
    const user = await User.findById(req.user.id).select('addresses');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    return res.status(200).json({
      message: 'Addresses fetched successfully',
      addresses: user.addresses || [],
    });
     } catch (error) {
    console.error('Get addresses error:', error);

    return res.status(500).json({
      message: 'Addresses fetch nahi ho paye',
    });
  }
});

// for delete address 
router.delete('/addresses/:addressId', protect, async (req, res) => {
   try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        message: 'Invalid address ID',
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'addresses._id': addressId,
      },
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'User or address not found',
      });
    }

    return res.status(200).json({
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Delete address error:', error);

    return res.status(500).json({
      message: 'Address delete nahi ho paya',
    });
  }
});


module.exports = router;
