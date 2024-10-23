// Import dependencies
const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const authRouter = require("./auth");
const cors = require("cors");

// Create Express app
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api", authRouter);

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const activeUsers = new Map();
// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");
  // add new online users

  // Emit socket ID to client
  socket.emit("me", socket.id);

  // Send current active users list to newly connected client
  socket.emit("users:list", Array.from(activeUsers.values()));

  socket.on("user:join", (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
    };

    activeUsers.set(socket.id, user);

    // Emit to all clients including sender
    io.emit("users:list", Array.from(activeUsers.values()));

    // Notify others about new user
    socket.broadcast.emit("user:joined", user);

    socket.on("user:leaveActiveList", ({ socketId }) => {
      const user = activeUsers.get(socketId);
      if (user) {
        activeUsers.delete(socket.id);
        io.emit("users:list", Array.from(activeUsers.values()));
        socket.broadcast.emit("user:left", user);
      }
    });
    socket.on("user:disconnect", ({ socketId }) => {
      const user = activeUsers.get(socketId);
      if (user) {
        activeUsers.delete(socket.id);
        io.emit("users:list", Array.from(activeUsers.values()));
        socket.broadcast.emit("user:left", user);
      }
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.broadcast.emit("callEnded");

    // Handle user disconnection from active users list
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      io.emit("users:list", Array.from(activeUsers.values()));
      socket.broadcast.emit("user:left", user);
    }
  });

  // Handle call user
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  // Handle answer call
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
