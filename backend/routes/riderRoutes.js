const express = require("express");
const { getAllRiders } = require("../controllers/riderController");
const { protectAdmin } = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getAllRiders);

module.exports = router;