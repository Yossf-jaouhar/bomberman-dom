// gameHandlers.js

export function applyGameStart(data, setMapTiles, setPlayers, tileSize) {
  setMapTiles(data.map);

  const playersArray = Object.entries(data.players).map(([name, info]) => ({
    name,
    pixelX: info.x * tileSize,
    pixelY: info.y * tileSize,
    tileX: info.x,
    tileY: info.y,
    avatar: info.avatar?.replace(".png", "") || "",
  }));

  setPlayers(playersArray);
}

export function applyUpdatePlayers(data, setPlayers) {
  setPlayers((prevPlayers) => {
    if (!Array.isArray(prevPlayers)) {
      prevPlayers = [];
    }

    const updatedPlayers = [];

    const incomingNames = Object.keys(data.playersPositions);

    const playerMap = new Map(prevPlayers.map((p) => [p.name, p]));

    for (const name of incomingNames) {
      const pos = data.playersPositions[name];
      const existing = playerMap.get(name);

      if (existing) {
        updatedPlayers.push({
          ...existing,
          pixelX: pos.pixelX,
          pixelY: pos.pixelY,
          tileX: pos.tileX,
          tileY: pos.tileY,
        });
      } else {
        updatedPlayers.push({
          name,
          pixelX: pos.pixelX,
          pixelY: pos.pixelY,
          tileX: pos.tileX,
          tileY: pos.tileY,
        });
      }
    }

    return updatedPlayers;
  });
}

export function handlePlayerDied(
  pendingState,
  playerName,
  setPlayers,
  setGameOver,
  cleanupPlayerMovement
) {
  setPlayers((prevPlayers) => {
    if (!Array.isArray(prevPlayers)) {
      prevPlayers = [];
    }
    return prevPlayers.filter(
      (p) => p.name !== pendingState.playerDied.name
    );
  });

  if (pendingState.playerDied.name === playerName()) {
    cleanupPlayerMovement();
    setGameOver(true);
  }
  pendingState.playerDied = {};
}

export function handleWin(
  pendingState,
  setPlayers,
  cleanupPlayerMovement,
  setGameWin
) {
  setPlayers((prevPlayers) => {
    if (!Array.isArray(prevPlayers)) {
      prevPlayers = [];
    }
    return prevPlayers.filter((p) => p.name !== pendingState.win.name);
  });
  cleanupPlayerMovement();
  setGameWin(true);
  pendingState.win = {};
}

export function handleBombsPlaced(pendingState, setBombs) {
  setBombs((prev) => [
    ...prev,
    ...pendingState.bombsPlaced.map((data) => ({
      x: data.x,
      y: data.y,
      owner: data.owner,
    })),
  ]);
  pendingState.bombsPlaced = [];
}

export function handleBombsExploded(pendingState, setBombs, setExplosions) {
  while (pendingState.bombsExploded.length > 0) {
    const data = pendingState.bombsExploded.shift();
    const bomb = data.bomb;

    // remove bomb
    setBombs((prev) =>
      prev.filter(
        (b) =>
          !(b.x === bomb.x && b.y === bomb.y && b.owner === bomb.owner)
      )
    );

    // add explosion
    setExplosions((prev) => {
      const destroyed = data.destroyedBlocks.map((block) => ({
        x: block.x,
        y: block.y,
        owner: bomb.owner,
      }));
      return [
        ...prev,
        { x: bomb.x, y: bomb.y, owner: bomb.owner },
        ...destroyed,
      ];
    });

    // clear explosion after 100ms
    setTimeout(() => {
      setExplosions((prev) =>
        prev.filter(
          (e) =>
            !(e.x === bomb.x && e.y === bomb.y && e.owner === bomb.owner) &&
            !data.destroyedBlocks.some(
              (dt) => dt.x === e.x && dt.y === e.y
            )
        )
      );
    }, 100);
  }
}

export function handleExplosionsFullUpdate(pendingState, setExplosions) {
  setExplosions(pendingState.explosionsFullUpdate.explosions);
  pendingState.explosionsFullUpdate = null;
}

export function handleMapChange(pendingState, setMapTiles) {
  setMapTiles(pendingState.mapChange.map);
  pendingState.mapChange = null;
}

export function handleLifeUpdate(pendingState, setPlayerLives) {
  setPlayerLives(pendingState.lifeUpdate.lives);
  pendingState.lifeUpdate = null;
}

export function handlePowerUps(pendingState, setPowerUps) {
  setPowerUps((prev) => [...prev, pendingState.powerUps]);
  pendingState.powerUps = {};
}

export function handlePowerUpPicked(
  pendingState,
  setPowerUps,
  setSpeed,
  setMaxBoms,
  setExplosionRange
) {
  const { newValue, x, y, type } = pendingState.powerUpPicked;

  setPowerUps((prev) =>
    prev.filter((p) => !(p.x === x && p.y === y))
  );

  switch (type) {
    case "Speed":
      setSpeed(newValue);
      break;
    case "Bomb":
      setMaxBoms(newValue);
      break;
    case "Flame":
      setExplosionRange(newValue);
      break;
    default:
      console.warn(`Unknown power-up type: ${type}`);
      break;
  }

  pendingState.powerUpPicked = null;
}

export function handleRemovePowerUp(pendingState, setPowerUps) {
  const { x, y } = pendingState.removePowerUp;
  setPowerUps((prev) =>
    prev.filter((p) => !(p.x === x && p.y === y))
  );
  pendingState.removePowerUp = null;
}
