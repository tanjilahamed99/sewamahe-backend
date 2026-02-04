const admin = require("firebase-admin");

module.exports.pushNotification = async (data = {}) => {
  const { 
    title, 
    token, 
    body, 
    type,
    meetingID,
    roomID,
    caller,
    callee,
    status
  } = data;
  
  if (!token) {
    console.log("No FCM token provided");
    return;
  }

  console.log("Sending push notification with data:", {
    title,
    type,
    meetingID,
    roomID,
    callerId: caller?._id,
    calleeId: callee?._id,
  });

  // Create minimal user objects with ONLY essential fields
  const minimalCaller = caller ? {
    _id: caller._id?.toString() || "",
    firstName: caller.firstName?.toString() || "",
    lastName: caller.lastName?.toString() || "",
    avatar: caller.avatar?.toString() || "",
    phone: caller.phone?.toString() || "",
    email: caller.email?.toString() || "",
    // REMOVE all unnecessary large fields
  } : {};

  const minimalCallee = callee ? {
    _id: callee._id?.toString() || "",
    firstName: callee.firstName?.toString() || "",
    lastName: callee.lastName?.toString() || "",
    avatar: callee.avatar?.toString() || "",
    phone: callee.phone?.toString() || "",
    email: callee.email?.toString() || "",
  } : {};

  try {
    const message = {
      token,
      data: {
        // REQUIRED: All values must be strings
        type: "call",
        callId: meetingID?.toString() || "",
        roomId: roomID?.toString() || "",
        roomID: roomID?.toString() || "", // Duplicate for compatibility
        meetingID: meetingID?.toString() || "",
        
        // User display name
        callerName: caller ? 
          `${caller.firstName || ""} ${caller.lastName || ""}`.trim() : "",
        
        // Stringified user objects
        caller: JSON.stringify(minimalCaller),
        callee: JSON.stringify(minimalCallee),
        
        // Additional IDs as strings
        callerId: caller?._id?.toString() || "",
        calleeId: callee?._id?.toString() || "",
        
        // Status if needed
        status: status?.toString() || "200",
        
        // For Redux token
        token: token || "",
      },

      // Notification for foreground
      notification: {
        title: title?.toString() || "Incoming Call",
        body: body?.toString() || "You have an incoming call",
      },

      // Web push config
      webpush: {
        notification: {
          requireInteraction: true,
          icon: "/call.png",
          actions: [
            { action: "accept", title: "Accept" },
            { action: "reject", title: "Reject" },
          ],
          // Include data in webpush too
          data: {
            type: "call",
            roomId: roomID?.toString() || "",
          }
        },
      },

      // Android config
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "calls",
        },
      },

      // APNS config for iOS
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            mutableContent: 1,
          },
        },
      },
    };

    const res = await admin.messaging().send(message);
    console.log("✅ Push notification sent successfully:", res);
    return res;
    
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);
    
    // FALLBACK: Send only essential data if payload is too large
    if (error.errorInfo?.code === 'messaging/invalid-argument' || 
        error.message.includes('too big')) {
      console.log("📦 Payload too large, sending minimal version...");
      
      const fallbackMessage = {
        token,
        data: {
          type: "call",
          callId: meetingID?.toString() || "",
          roomId: roomID?.toString() || "",
          roomID: roomID?.toString() || "",
          meetingID: meetingID?.toString() || "",
          callerName: caller ? 
            `${caller.firstName || ""} ${caller.lastName || ""}`.trim() : "",
          callerId: caller?._id?.toString() || "",
          calleeId: callee?._id?.toString() || "",
          status: status?.toString() || "200",
          token: token || "",
        },
        notification: {
          title: title?.toString() || "Incoming Call",
          body: body?.toString() || "You have an incoming call",
        },
      };
      
      try {
        const fallbackRes = await admin.messaging().send(fallbackMessage);
        console.log("✅ Fallback notification sent:", fallbackRes);
        return fallbackRes;
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError.message);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};