const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getWebSiteInfo } = require("../controllers/webSiteController");

const router = express.Router();

router.get("/get", getWebSiteInfo);

module.exports = router;
