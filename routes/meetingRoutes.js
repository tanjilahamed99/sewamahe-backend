const express = require("express");
const router = express.Router();
const {
    getMeeting,
    answerMeeting,
    closeMeeting,
    callMeeting,
    getCustomCallData,
} = require("../controllers/MeetingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/get", protect, getMeeting);
router.post("/call", protect, callMeeting);
router.post("/answer", protect, answerMeeting);
router.post("/close", protect, closeMeeting);
router.get("/customCallData/:meetingID", protect, getCustomCallData);

module.exports = router;
