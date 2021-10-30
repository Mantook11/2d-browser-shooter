const initializePlayerCharacter = (color) => {
  return { color, radius: 0.5 };
};

const calculateDir = (state, mousePos) => {
  const x = mousePos.x - state.x;
  const y = mousePos.y - state.y;
  const magnitude = Math.sqrt(x * x + y * y);
  return dir = { x: x / magnitude, y: y / magnitude }
}

const iterateShots = (shots) => {
  for (const i in shots) {
    const shot = shots[i];
    shot.position.x += shot.dir.x * shot.x;
    shot.position.y += shot.dir.y * shot.y;
    shots[i] = shot;
  }
}

module.exports = { initializePlayerCharacter, calculateDir, iterateShots };
