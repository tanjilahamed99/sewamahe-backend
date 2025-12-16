const express = require("express");
const { addRoom, deleteRoom, getRoom, getRooms, joinRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/list", protect, getRooms);
// router.get("/join/:id", protect, getRoom);
router.get("/join/:id", protect, joinRoom);
router.post("/",protect, addRoom);
router.post("/remove", protect, deleteRoom);

module.exports = router;