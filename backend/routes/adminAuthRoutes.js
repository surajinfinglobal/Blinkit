const express = require("express");
const { loginAdmin, getMe } = require("../controllers/adminAuthController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getMe);

module.exports = router;