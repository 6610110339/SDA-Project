const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

let isServerRunning = false;

app.get("/status", (req, res) => {
  res.json({ online: isServerRunning });
});

io.on("connection", (socket) => {
  if (!isServerRunning) {
    console.log("Client attempted to connect, but server is offline:", socket.id);
    socket.disconnect();
    return;
  }

  console.log("Client connected:", socket.id);
  socket.emit("serverStatus", isServerRunning);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


app.post("/start", (req, res) => {
  if (!isServerRunning) {
    isServerRunning = true;
    console.log("Server started!");

    io.emit("serverStatus", isServerRunning);
    return res.json({ message: "Server started!", online: true });
  }
  res.json({ message: "Server is already running", online: true });
});

app.post("/stop", (req, res) => {
  if (isServerRunning) {
    isServerRunning = false;
    console.log("Server stopped!");

    io.emit("serverStatus", isServerRunning);
    return res.json({ message: "Server stopped!", online: false });
  }
  res.json({ message: "Server is already stopped", online: false });
});

httpServer.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});
