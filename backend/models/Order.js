const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    deliveryAddress: {
      area: String,
      landmark: String,
      city: String,
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      required: true,
    },

    orderStatus: {
      type: String,
      enum: [
        'received',
        'packing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'received',
    },

    billDetails: {
      itemTotal: Number,
      deliveryFee: Number,
      grandTotal: Number,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)