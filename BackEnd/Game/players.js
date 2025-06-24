const { game } = require("./game");

function JoinRoom(socket) {
  const name = socket.handshake.query.name;

  if (!name) {
    socket.emit("error", { message: "Name parameter is required" });
    socket.disconnect();
    return { name: null, room: null };
  }

  const room = game.join(name);
  console.log(`Client connected: ${name} joined room with ${room.players.length} player(s)`);

  socket.emit("joined", {
    name,
    players: room.players.map((player) => player.name),
    roomId: room.id,
  });

  return { name, room };
}

module.exports = JoinRoom;