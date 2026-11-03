
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    line: { type: String, required: true, trim: true },
    houseNo: String,
    floor: String,
    area: String,
    landmark: String,
    city: String,
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/,
    },
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "received",
        "packing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "received",
    },
        assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },

    billDetails: {
      itemTotal: { type: Number, required: true, min: 0 },
      handlingFee: { type: Number, default: 0, min: 0 },
      deliveryFee: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      savedAmount: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },

    coupon: {
      code: { type: String, default: "" },
      applied: { type: Boolean, default: false },
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
