const xss = require("xss");
const Meeting = require("../models/Meeting");
const Room = require("../models/Rooms");
const User = require("../models/User");
const store = require("../store");
const { pushNotification } = require("../utils/sendPushNotification");

// ✅ Create a new meeting
exports.getMeeting = async (req, res) => {
  try {
    const { caller, callee, type } = req.body;

    const meeting = await new Meeting({
      caller,
      callee,
      type,
    }).save();

    return res.status(200).json(meeting);
  } catch (err) {
    console.error("Error creating meeting:", err);
    return res.status(500).json({ error: "Failed to create meeting" });
  }
};

// ✅ Send meeting (call) notification to all members in a room
exports.callMeeting = async (req, res) => {
  try {
    const { roomID, meetingID, type } = req.body;

    if (!roomID || !meetingID) {
      return res.status(400).json({ error: "Missing roomID or meetingID" });
    }

    const user = await User.findById(req.user._id)
      .select("-email -password -friends -__v")
      .populate({ path: "picture", strictPopulate: false });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the room with participants
    const room = await Room.findById(roomID).populate({
      path: "people",
      select: "-email -password -friends -__v",
      populate: { path: "picture" },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Notify all participants except the caller
    const myUserID = req.user._id.toString();

    room.people.forEach(async (person) => {
      const personUserID = person._id.toString();
      if (personUserID !== myUserID) {
        store.io.to(personUserID).emit("call", {
          status: 200,
          room,
          meetingID,
          roomID,
          type,
          caller: user,
          callee: person,
        });

        // push notification setup for user
        const notifyUser = await User.findById(personUserID);

        const data = {
          type: "call",
          status: "200",
          meetingID,
          roomID,
          token: notifyUser.fcmToken,
        };

        if (notifyUser.fcmToken) {
          pushNotification(data);
        }
      }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error posting meeting:", err);
    return res.status(500).json({ error: "Failed to post meeting" });
  }
};

exports.answerMeeting = (req, res) => {
  let { userID } = req.body;
  store.io.to(userID).emit("answer", {
    status: 200,
  });
  store.io.to(req.user._id.toString()).emit("answer", {
    status: 200,
  });
  store.onlineUsers.set(req.user._id.toString(), {
    id: req.user._id.toString(),
    status: "busy",
  });
  store.onlineUsers.set(userID, { id: userID, status: "busy" });
  res.status(200).json({ ok: true });
};

exports.closeMeeting = (req, res) => {
  let { userID } = req.body;
  store.io.to(userID).emit("close", { status: 200 });
  store.onlineUsers.set(req.user._id.toString(), {
    id: req.user._id.toString(),
    status: "online",
  });
  store.onlineUsers.set(userID, { id: userID, status: "online" });
  res.status(200).json({ ok: true });
};

exports.getCustomCallData = async (req, res) => {
  let { meetingID } = req.params;

  if (!meetingID) {
    return res.status(300).send({
      message: "MeetingID required",
    });
  }

  const meetingData = await Meeting.findById(meetingID);
  const caller = await User.findById(meetingData.caller);

  const room = await Room.findOne({
    people: { $all: [meetingData.caller, req.user._id], $size: 2 },
    isGroup: false,
  }).populate({
    path: "people",
    select: "-email -password -friends -__v",
    populate: { path: "picture" },
  });

  const data = {
    status: 200,
    meetingID,
    roomID: room?._id,
    room,
    type: meetingData.type,
    caller,
    callee: req.user,
  };

  res.json(data);
};

// http://localhost:5173/callStatus?meetingID=69c6bca45881b3c87acc5a10&action=accept
