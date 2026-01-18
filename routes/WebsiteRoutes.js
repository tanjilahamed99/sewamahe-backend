const express = require("express");
const { getWebSiteInfo, getLiveKitUserData } = require("../controllers/webSiteController");

const router = express.Router();

router.get("/get", getWebSiteInfo);
router.get("/liveKit/get", getLiveKitUserData);

module.exports = router;
