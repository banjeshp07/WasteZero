const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
const socketHandler = require("./socket/chatSocket")

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);



const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});


socketHandler(io);

// Make io accessible in routes
app.set('io', io);


app.use(cors({
  origin: "https://waste-zero-banjesh.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/connections", require("./routes/connectionRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/match", require("./routes/matchRoutes"));

// --- GLOBAL ERROR HANDLER (Recommended Addition) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

// Seed Admin User
const { seedAdmin } = require("./controllers/adminController");
seedAdmin();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
