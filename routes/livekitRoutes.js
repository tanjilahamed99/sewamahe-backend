const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { AccessToken } = require("livekit-server-sdk");
const User = require("../models/User");
const store = require("../store");
dotenv.config();

router.post("/token", async (req, res) => {
    const { roomName, userId, calleeId } = req.body;
    const user = await User.findById(userId).select("username");
    
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: user.username,
        }
    );
    at.addGrant({
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        room: roomName,
    });
    const token = await at.toJwt();
    if (userId !== calleeId) {
        store.io.to(calleeId).emit("setCallToken", {
            token,
        });
    }
    res.json({ token });
});

module.exports = router;
