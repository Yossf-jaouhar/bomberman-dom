let map = new Map(13, 15, 40);
let players = {
  "player1": { x: 1, y: 1, explosionRange: 1, maxBombs: 1, lives: 3 },
};

socket.on("placeBomb", ({ playerId, row, col }) => {
  const player = players[playerId];
  if (!player) return;

  if (player.maxBombs <= 0) {
    console.log("Player has no bombs available");
    return;
  }

  player.maxBombs--;

  io.emit("bombPlaced", { playerId, row, col });

  setTimeout(() => {
    const changes = explodeBomb(player, row, col);
    player.maxBombs++;
    io.emit("explosionResult", changes);
  }, 3000);
});


function explodeBomb(player, row, col) {
  const results = {
    brokenBlocks: [],
    damagedPlayers: []
  };
  const range = player.explosionRange;


  applyExplosion(row, col, results);

  const directions = [
    [-1, 0], 
    [1, 0],  
    [0, -1], 
    [0, 1]  
  ];

  for (const [dr, dc] of directions) {
    for (let i = 1; i <= range; i++) {
      const r = row + dr * i;
      const c = col + dc * i;

      if (map.isWall(r, c)) {
        break;
      } else if (map.isBreakable(r, c)) {
        map.breakBlock(r, c);
        results.brokenBlocks.push({ row: r, col: c });
        break;
      } else {
        applyExplosion(r, c, results);
      }
    }
  }

  return results;

  function applyExplosion(r, c, results) {
    for (const [id, p] of Object.entries(players)) {
      if (p.x === c && p.y === r) {
        p.lives--; 
        results.damagedPlayers.push({ id, lives: p.lives });
      }
    }
  }
}