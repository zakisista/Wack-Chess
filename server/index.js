const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: "*",
});

const users = [];
const whiteUsers = [];
const blackUsers = [];

io.on("connection", (socket) => {
  console.log("connected");

  if (users.length >= 2) {
    socket.disconnect();
  }

  users.push(socket.id);

  if (users.length === 1) {
    whiteUsers.push(socket.id);
    socket.emit("color", "white");
  } else {
    blackUsers.push(socket.id);
    socket.emit("color", "black");
  }

  socket.on('updateBoard', (newBoardState) => {
    socket.broadcast.emit('updateBoard', newBoardState)
  })

  socket.on("disconnect", () => {
    console.log("disconnected");
    const index = users.indexOf(socket.id);
    if (index > -1) {
      users.splice(index, 1);
      if (index === 0) {
        whiteUsers.splice(whiteUsers.indexOf(socket.id), 1);
      } else {
        blackUsers.splice(blackUsers.indexOf(socket.id), 1);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
