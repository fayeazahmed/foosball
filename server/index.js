const app = require('express')();
const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
const socket = require("socket.io");

const sockets = []
const players = []

const io = socket(server, { cors: { origin: '*' } });

io.on("connection", function (socket) {
  console.log("Made socket connection");
  socket.on("standby", pName => {
    sockets.push(socket)
    players.push({ id : socket.id, pName})
    socket.emit("position", sockets.indexOf(socket))
    io.emit("players", players)
  })

  socket.on("updates", (position, velocity) => socket.broadcast.emit("updates", position, velocity))
  
  socket.on("updateHandle", (playerPosition, direction) => socket.broadcast.emit("updateHandle", playerPosition, direction))
  
  socket.on("updateHandleState", (handle, state) => socket.broadcast.emit("updateHandleState", handle, state))
  
  socket.on("scorer", scorer => socket.broadcast.emit("scorer", scorer))
  
  socket.on("finishGame", (winnerSide, color) => socket.broadcast.emit("finishGame", winnerSide, color))
  
  socket.on("disconnect", () => {
    sockets.includes(socket) && sockets.splice(sockets.indexOf(socket), 1)
    for(let i = 0; i < players.length; i++)
      if(players[i].id === socket.id) {
        players.splice(i, 1)
        break
      }
    io.emit("players", players)
  })
});