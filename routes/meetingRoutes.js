const express = require("express");
const router = express.Router();
const {
    getMeeting,
    answerMeeting,
    closeMeeting,
    callMeeting,
} = require("../controllers/MeetingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/get", protect, getMeeting);
router.post("/call", protect, callMeeting);
router.post("/answer", protect, answerMeeting);
router.post("/close", protect, closeMeeting);

module.exports = router;
