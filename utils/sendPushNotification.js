const admin = require("firebase-admin");

module.exports.pushNotification = async (data = {}) => {
  const { 
    token, 
    meetingID,
    roomID,
    caller,
    callee,
  } = data;
  
  if (!token) {
    console.log("No FCM token");
    return;
  }

  // Minimal user objects
  const minimalCaller = {
    _id: caller._id?.toString() || "",
    firstName: caller.firstName?.toString() || "",
    lastName: caller.lastName?.toString() || "",
    avatar: caller.avatar?.toString() || "",
  };

  const minimalCallee = {
    _id: callee._id?.toString() || "",
    firstName: callee.firstName?.toString() || "",
    lastName: callee.lastName?.toString() || "",
    avatar: callee.avatar?.toString() || "",
  };

  const message = {
    token,
    data: {
      type: "call",
      roomID: roomID.toString(),
      meetingID: meetingID.toString(),
      caller: JSON.stringify(minimalCaller),
      callee: JSON.stringify(minimalCallee),
      callerName: `${caller.firstName} ${caller.lastName}`,
      token: token,
      status: "200",
    },
    notification: {
      title: "📞 Incoming Call",
      body: `${caller.firstName} ${caller.lastName} is calling you`,
    },
    webpush: {
      notification: {
        requireInteraction: true,
        actions: [
          { action: "accept", title: "Accept" },
          { action: "reject", title: "Reject" },
        ],
      },
    },
  };

  try {
    const res = await admin.messaging().send(message);
    console.log("✅ Push notification sent");
    return res;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};