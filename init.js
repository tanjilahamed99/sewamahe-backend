const jwt = require("jsonwebtoken");
const store = require("./store");
const User = require("./models/User");

module.exports = () => {
  store.onlineUsers = new Map();

  store.io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: token required"));
    }

    try {
      const payload = jwt.verify(token, store.config.secret);
      socket.user = payload;
      next();
    } catch (err) {
      return next(new Error("Authentication error: invalid token"));
    }
  });

  // Connection

  store.io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log("User connected:", socket.user.email);

    // Join personal room
    socket.join(userId);

    // Ensure user has a Set
    if (!store.onlineUsers.has(userId)) {
      store.onlineUsers.set(userId, new Set());
    }

    const userSockets = store.onlineUsers.get(userId);

    // Extra safety: ensure it's a Set
    if (!(userSockets instanceof Set)) {
      store.onlineUsers.set(userId, new Set());
    }

    store.onlineUsers.get(userId).add(socket.id);

    emitOnlineUsers();

    // Custom Events
    socket.on("typing", ({ room, userId, isTyping }) => {
      socket.to(room).emit("userTyping", { room, userId, isTyping });
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    //  Disconnect
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);

      const sockets = store.onlineUsers.get(userId);

      if (sockets && sockets instanceof Set) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          store.onlineUsers.delete(userId);

          try {
            await User.findByIdAndUpdate(userId, {
              lastOnline: Date.now(),
            });
            console.log("User fully offline:", userId);
          } catch (err) {
            console.error("Failed updating lastOnline:", err);
          }
        }
      } else {
        console.warn("Invalid socket structure for user:", userId);
      }

      emitOnlineUsers();
    });
  });

  function emitOnlineUsers() {
    const formattedUsers = Array.from(store.onlineUsers.keys()).map((id) => ({
      id,
      status: "online",
    }));

    store.io.emit("onlineUsers", formattedUsers);
  }
};
