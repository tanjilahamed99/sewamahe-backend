const admin = require("firebase-admin");

module.exports.pushNotification = async (data = {}) => {
  const { title, token, body, type, callerName, callId, roomId } = data;
  if (!token) {
    return;
  }

  const message = {
    token,
    data: {
      type,
      callId,
      roomId,
      callerName,
      body,
      title,
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

  const res = await admin.messaging().send(message);
  console.log(res);
};
