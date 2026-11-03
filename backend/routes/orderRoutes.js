const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/orders", authMiddleware, placeOrder);
router.get("/orders/my-orders", authMiddleware, getMyOrders);

module.exports = router;