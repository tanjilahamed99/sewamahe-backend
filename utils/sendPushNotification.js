const admin = require("firebase-admin");

module.exports.pushNotification = async (data = {}) => {
  const { token } = data;

  if (!token) {
    console.log("No FCM token");
    return;
  }

  const message = {
    token,
    data: {
      ...data,
    },
    webpush: {
      notification: {
        requireInteraction: true,
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
