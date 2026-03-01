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

require("dotenv").config();

const admin = require("firebase-admin");


console.log()

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});

admin
  .auth()
  .listUsers(1)
  .then(() => console.log("Firebase Admin connected ✅"))
  .catch(console.err);

// ✅ Initialize Socket.IO properly
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "https://sawamahe-frontend.vercel.app",
      "http://localhost:4173",
    ],
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
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://sawamahe-frontend.vercel.app",
      "http://localhost:4173",
    ],
    credentials: true,
  }),
);
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
app.use("/api/contact", require("./routes/contactRoutes"));

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
