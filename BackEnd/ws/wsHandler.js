
const WebSocket = require('ws');
const { game } = require('../Game/game');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    

    //Joining the game
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name');
    if (!name) {
      ws.send('Error: Name parameter is required');
      ws.close();
      return;
    }
    const room = game.join(name);
    console.log(`Client connected: ${name} joined room with ${room.players.length} player(s)`);
    ws.send(`Welcome ${name}! You joined a room with ${room.players.length} player(s).`);
    



    ws.on('message', (message) => {
      console.log(`[${name}]: ${message}`);
      ws.send(`Server received: ${message}`);
    });

    ws.on('close', () => {
      room.removePlayer(name);
      console.log(`Client disconnected: ${name} left the room. Remaining players: ${room.players.length}`);
      
    });
  });
}

module.exports = setupWebSocket;
