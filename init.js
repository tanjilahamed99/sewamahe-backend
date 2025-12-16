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
            next(new Error("Authentication error: invalid token"));
        }
    });

    store.io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.email}`);
        socket.join(socket.user.id);
        
        socket.on("typing", ({ room, userId, isTyping }) => {
            socket.to(room).emit("userTyping", { room, userId, isTyping });
        });

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });

        store.onlineUsers.set(socket, { id: socket.user.id, status: "online" });
        store.io.emit(
            "onlineUsers",
            Array.from(store.onlineUsers.values())
        );

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.email}`);
            User.findOneAndUpdate(
                { _id: socket.user.id },
                { $set: { lastOnline: Date.now() } }
            )
                .then(() => console.log("last online " + socket.user.id))
                .catch((err) => console.log(err));
            store.onlineUsers.delete(socket);
            store.io.emit(
                "onlineUsers",
                Array.from(store.onlineUsers.values())
            );
        });
    });
}