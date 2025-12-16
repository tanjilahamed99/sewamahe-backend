const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const store = require("./store");
const init = require("./init");
Config = require("./config");
const path = require("path");
dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);

// ✅ Initialize Socket.IO properly
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});
store.io = io;
store.config = Config;

try {
    init();
} catch (err) {
    console.error("Init failed:", err);
}

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/livekit", require("./routes/livekitRoutes"));
app.use("/api/meeting", require("./routes/meetingRoutes"));
app.use("/api/website", require("./routes/WebsiteRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check route
app.get("/", (req, res) => {
    res.send("Sewamahe is running ✅");
});

// Error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something broke!" });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
