const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders,cancelorder} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/orders", authMiddleware, placeOrder);
router.post("/orders/:orderId/cancel", authMiddleware, cancelorder);

router.get("/orders/my-orders", authMiddleware, getMyOrders);

module.exports = router;