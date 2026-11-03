const User = require("../models/User");
const Order = require("../models/Order");

exports.getAllUsersWithOrders = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",        // collection name
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $project: {
          otp: 0,
          otpExpires: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("getAllUsersWithOrders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users with orders" });
  }
};


// exports.getUserWithOrdersById = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findById(userId).select("-otp -otpExpires").lean();
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const orders = await Order.find({ userId: user._id })
//       .sort({ createdAt: -1 })
//       .populate("assignedRider", "name phone status vehicle hub")
//       .lean();

//     return res.status(200).json({ success: true, user: { ...user, orders } });
//   } catch (error) {
//     console.error("getUserWithOrdersById error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch user details" });
//   }
// };