const express = require("express");
const router = express.Router();
const {
    sendMessage,
    getMoreMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.post("/more", protect, getMoreMessages);

module.exports = router;
