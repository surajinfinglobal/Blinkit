const mongoose = require("mongoose");
const Order = require("../models/Order");
const Rider = require("../models/Rider");
const express = require("express");

const router = express.Router();

const { protectAdmin } = require("../middleware/adminAuthMiddleware");

const allowedStatuses = [
  "received",
  "packing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "fullName phone email")
      .populate("assignedRider", "name phone status vehicle hub");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get all admin orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Orders fetch nahi ho sake",
    });
  }
};

router.get("/orders", protectAdmin, getAllOrders);

// GET: Active riders jo available hain
router.get(
  "/riders", protectAdmin, async (req, res)=>{
    try {
      const riders = await Rider.find({
        isActive: true,
        status: "available",
      }).select("name phone status vehicle hub");

      res.json({ success: true, riders });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Riders fetch nahi ho sake",
      });
    }
  }
);

// PATCH: Order ko rider assign karna
router.patch(
  "/orders/:id/assign-rider", protectAdmin, async (req, res) => {
    try {
      const { riderId } = req.body;
       if (
        !mongoose.isValidObjectId(req.params.id) ||
        !mongoose.isValidObjectId(riderId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID ya rider ID",
        });
      }
       const order = await Order.findById(req.params.id);
        if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order nahi mila",
        });
      }
      if (
        ["delivered", "cancelled"].includes(order.orderStatus)
      ) {
        return res.status(400).json({
          success: false,
          message: "Completed ya cancelled order par rider assign nahi kar sakte",
        });
      }
      if (order.assignedRider?.toString() === riderId) {
        const unchangedOrder = await Order.findById(order._id)
          .populate("assignedRider", "name phone status vehicle hub");
        return res.json({
          success: true,
          message: "Rider already assigned to this order",
          order: unchangedOrder,
        });
      }

      const rider = await Rider.findOneAndUpdate(
        {
          _id: riderId,
          isActive: true,
          status: "available",
        },
        { $set: { status: "in-transit", mission: order.orderId } },
        { new: true }
      );
      if (!rider) {
        return res.status(400).json({
          success: false,
          message: "Rider available nahi hai",
        });
      }

      const previousRiderId = order.assignedRider;
      try {
        order.assignedRider = rider._id;
        await order.save();
      } catch (error) {
        await Rider.findByIdAndUpdate(rider._id, {
          $set: { status: "available", mission: null },
        });
        throw error;
      }

      if (previousRiderId) {
        await Rider.findByIdAndUpdate(previousRiderId, {
          $set: { status: "available", mission: null },
        });
      }

      const updatedOrder = await Order.findById(order._id)
        .populate("assignedRider", "name phone status vehicle hub");
        res.json({
        success: true,
        message: "Rider successfully assign ho gaya",
        order: updatedOrder,
      });
      } catch (error) {
      res.status(500).json({
        success: false,
        message: "Rider assign nahi ho saka",
      });
    }
  }
);

// PATCH: Order status update karna
router.patch(
  "/orders/:id/status",
  protectAdmin,
  async (req, res) => {
    try {
      const { orderStatus } = req.body;
       if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }
       if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }
       const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order nahi mila",
        });
      }
      if (["delivered", "cancelled"].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Order already completed hai",
        });
      }
      if (
        orderStatus === "out_for_delivery" &&
        !order.assignedRider
      ) {
        return res.status(400).json({
          success: false,
          message: "Pehle rider assign karo",
        });
      }
       order.orderStatus = orderStatus;
       await order.save();
      if (["delivered", "cancelled"].includes(orderStatus) && order.assignedRider) {
        await Rider.findByIdAndUpdate(order.assignedRider, {
          $set: { status: "available", mission: null },
        });
      }
        const updatedOrder = await Order.findById(order._id)
        .populate("assignedRider", "name phone status vehicle hub");

      res.json({
        success: true,
        message: "Order status update ho gaya",
        order: updatedOrder,
      });} catch (error) {
      res.status(500).json({
        success: false,
        message: "Order status update nahi ho saka",
      });
    }
  }
);

module.exports = router;
