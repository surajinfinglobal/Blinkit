const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart.js');

const authMiddleware = require('../middleware/authMiddleware')
// Get logged-in user's cart

// Add product to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, name, image, unit, price } = req.body;

    if (!productId || !name || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: 'Valid productId, name and price are required',
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId === String(productId)
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.items.push({
        productId: String(productId),
        name,
        image: image || '',
        unit: unit || '1 item',
        price,
        qty: 1,
      });
    }

    await cart.save();

    res.status(200).json({
      message: 'Product added to cart',
      items: cart.items,
    });
  } catch (error) {
    console.error('Add cart error:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
});


// get product form the databse 
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    res.status(200).json({
      items: cart ? cart.items : [],
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// Update product quantity
router.patch('/:productId', authMiddleware, async (req, res) => {
  try {
    const qty = Number(req.body.qty);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer',
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(
      (item) => item.productId === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    item.qty = qty;
    await cart.save();

    res.status(200).json({
      message: 'Quantity updated',
      items: cart.items,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update quantity' });
  }
});

// Remove product from cart
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId !== req.params.productId
    );

    await cart.save();

    res.status(200).json({
      message: 'Product removed',
      items: cart.items,
    });
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ message: 'Failed to remove product' });
  }
});

module.exports = router;