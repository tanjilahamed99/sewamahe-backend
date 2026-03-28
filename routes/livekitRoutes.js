const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { AccessToken } = require("livekit-server-sdk");
const User = require("../models/User");
const store = require("../store");
const LiveKit = require("../models/LiveKit");
dotenv.config();

router.post("/token", async (req, res) => {
  const { roomName, userId, calleeId } = req.body;

  const user = await User.findById(userId).select("username");
  const liveKit = await LiveKit.findOne();

  if (!liveKit) {
    return res.send({
      message: "liveKit credentials not set",
    });
  }

  const callerToken = new AccessToken(liveKit.key, liveKit.secret, {
    identity: userId,
    name: user.username,
  });

  callerToken.addGrant({
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    room: roomName,
  });

  const calleeToken = new AccessToken(liveKit.key, liveKit.secret, {
    identity: calleeId,
  });

  calleeToken.addGrant({
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    room: roomName,
  });

  if (userId !== calleeId) {
    store.io.to(calleeId).emit("setCallToken", {
      token: await calleeToken.toJwt(),
    });
  }

  res.json({ token: await callerToken.toJwt() });
});
module.exports = router;
