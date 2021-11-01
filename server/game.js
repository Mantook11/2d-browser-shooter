const initializePlayerCharacter = (color) => {
  return { color, PLAYER_RADIUS: 0.5 };
};

const calculateDir = (state, mousePos) => {
  //Draw vector towards cursor
  const x = mousePos.x - state.x;
  const y = mousePos.y - state.y;
  const magnitude = Math.sqrt(x * x + y * y);
  //Return it normalized
  return { x: x / magnitude, y: y / magnitude };
};

const PLAYER_RADIUS = Number(process.env.PLAYER_RADIUS);
const BULLET_RADIUS = Number(process.env.BULLET_RADIUS);
const checkCollisions = (shot, states, socketId) => {
  for (const i in states) {
    if (i === socketId) continue;
    const state = states[i];
    if (shot.position.x <= state.x + PLAYER_RADIUS
      && shot.position.x >= state.x - PLAYER_RADIUS
      && shot.position.y <= state.y + PLAYER_RADIUS
      && shot.position.y >= state.y - PLAYER_RADIUS) {
      state.x = Math.floor(Math.random() * 600);
      state.y = Math.floor(Math.random() * 600);
      return true;
    }
  }
};

const CANVAS_WIDTH = Number(process.env.CANVAS_WIDTH);
const CANVAS_HEIGHT = Number(process.env.CANVAS_HEIGHT);
const getInsideCanvas = (socketId, shots, states) => {
  const playerPos = { ...states[socketId] };
  const shotsPruned = {};
  const statesPruned = {};

  for (const i in shots) {
    const shotPlayer = shots[i];
    const shotsToAdd = [];
    shotPlayer.forEach((shot) => {
      if (shot.position.x - BULLET_RADIUS > playerPos.x + CANVAS_WIDTH / 2
        || shot.position.x + BULLET_RADIUS < playerPos.x - CANVAS_WIDTH / 2
        || shot.position.y - BULLET_RADIUS > playerPos.y + CANVAS_HEIGHT / 2
        || shot.position.y + BULLET_RADIUS < playerPos.y - CANVAS_HEIGHT / 2) {
        return;
      }
      shotsToAdd.push(shot);
    })
    shotsPruned[i] = shotsToAdd;
  }

  for (const i in states) {
    const state = states[i];
    if (state.x - PLAYER_RADIUS > playerPos.x + CANVAS_WIDTH / 2
      || state.x + PLAYER_RADIUS < playerPos.x - CANVAS_WIDTH / 2
      || state.y - PLAYER_RADIUS > playerPos.y + CANVAS_HEIGHT / 2
      || state.y + PLAYER_RADIUS < playerPos.y - CANVAS_HEIGHT / 2) {
      continue;
    }
    statesPruned[i] = state;
  }

  return { shotsPruned, statesPruned }
}

const iterateShots = (shots, states) => {
  //Iterate through each players shots
  for (const i in shots) {
    //Get player Shots
    const shotPlayer = shots[i];
    //For each shot by a player run function
    shotPlayer.forEach((shot, index, object) => {
      //Check if next shot will be inside the canvas or not
      const checkY = shot.position.y + shot.dir.y * shot.y;
      const checkX = shot.position.x + shot.dir.x * shot.x;
      if (checkY < process.env.BULLET_RADIUS || checkY > process.env.MAP_HEIGHT - process.env.BULLET_RADIUS) {
        //If bounces are done then remove, else decrease bounce
        if (shot.bounces === 0) { object.splice(index, 1); return; }
        shot.dir.y = -shot.dir.y;
        shot.bounces--;
      }

      if (checkX < process.env.BULLET_RADIUS || checkX > process.env.MAP_WIDTH - process.env.BULLET_RADIUS) {
        if (shot.bounces === 0) { object.splice(index, 1); return; }
        shot.dir.x = -shot.dir.x;
        shot.bounces--;
      }

      const previousShot = { x: shot.position.x, y: shot.position.y }

      //Update positions
      shot.position.x += shot.dir.x * shot.x;
      shot.position.y += shot.dir.y * shot.y;

      const distanceMade = Math.hypot(previousShot.x - shot.position.x, previousShot.y - shot.position.y);
      shot.distance += distanceMade;


      const collision = checkCollisions(shot, states, i);
      if (collision) { object.splice(index, 1); return; }
      if (shot.distance >= Number(process.env.MAX_BULLET_DISTANCE)) { object.splice(index, 1); return; }
    });
  }
};

module.exports = { initializePlayerCharacter, calculateDir, iterateShots, getInsideCanvas };
