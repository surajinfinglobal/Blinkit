
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { randomBytes } = require("node:crypto");

exports.placeOrder = async (req, res) => {
    console.log("Place order request body:", req.body);
  try {
    const {
      items,
      address,
      paymentMethod,
      billDetails,
      coupon,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    const addressId = typeof address?.id === "string" ? address.id.trim() : "";
    const addressLabel = typeof address?.label === "string" ? address.label.trim() : "";
    const addressLine = typeof address?.line === "string" ? address.line.trim() : "";
    const addressPincode = String(address?.pincode ?? "").trim();

    if (
      !addressId ||
      !addressLabel ||
      !addressLine ||
      !/^\d{6}$/.test(addressPincode)
    ) {
      return res.status(400).json({
        message: "Delivery address must include an id, label, line, and valid 6-digit pincode",
      });
    }

    if (!["COD", "Online"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const invalidItem = items.some(
      (item) =>
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        typeof item.id !== "string" ||
        !item.id.trim() ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        typeof item.unit !== "string" ||
        !item.unit.trim() ||
        !Number.isFinite(item.basePrice) ||
        item.basePrice < 0 ||
        !Number.isInteger(item.qty) ||
        item.qty < 1 ||
        typeof item.image !== "string"
    );

    if (invalidItem) {
      return res.status(400).json({
        message: "Each order item must include id, name, unit, a valid basePrice, a positive integer qty, and an image string",
      });
    }

    // Production: verify product IDs, prices and stock in the database.
    const normalizedItems = items.map((item) => ({
      productId: item.id.trim(),
      name: item.name.trim(),
      unit: item.unit.trim(),
      price: item.basePrice,
      quantity: item.qty,
      image: item.image.trim(),
    }));

    // Recalculate using validated item prices.
    const itemTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const handlingFee = Number(billDetails?.handlingFee ?? 0);
    const deliveryFee = Number(billDetails?.deliveryFee ?? 0);
    const discount = Number(billDetails?.discount ?? 0);

    if (
      ![handlingFee, deliveryFee, discount].every(
        (value) => Number.isFinite(value) && value >= 0
      )
    ) {
      return res.status(400).json({
        message: "Invalid bill details",
      });
    }

    // Verify fees and discount on the server in production.
    const grandTotal = Math.max(
      0,
      itemTotal + handlingFee + deliveryFee - discount
    );

    const order = await Order.create({
      userId: req.user.id,
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`,
      items: normalizedItems,
      deliveryAddress: {
        id: addressId,
        label: addressLabel,
        line: addressLine,
        pincode: addressPincode,
        lat: address.lat,
        lng: address.lng,
      },
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "pending" : "pending",
      billDetails: {
        itemTotal,
        handlingFee,
        deliveryFee,
        discount,
        savedAmount: Number(billDetails?.savedAmount ?? 0),
        grandTotal,
      },
      coupon: {
        code: coupon?.applied ? coupon.code : "",
        applied: Boolean(coupon?.applied),
      },
    });

    await Cart.updateOne(
      { userId: req.user._id },
      { $set: { items: [] } }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);

    return res.status(500).json({
      message: "Order place nahi ho saka",
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("assignedRider", "name phone status vehicle hub");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Aapke orders fetch nahi ho sake",
    });
  }
};
