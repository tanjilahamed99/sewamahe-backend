const express = require("express");
const { getWebSiteInfo } = require("../controllers/webSiteController");

const router = express.Router();

router.get("/get", getWebSiteInfo);

module.exports = router;
