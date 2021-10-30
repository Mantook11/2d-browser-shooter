const initializePlayerCharacter = (color) => {
    return {color, radius: 0.5};
};

const calculateDir = (state, mousePos) => {
    //Draw vector towards cursor
    const x = mousePos.x - state.x;
    const y = mousePos.y - state.y;
    const magnitude = Math.sqrt(x * x + y * y);
    //Return it normalized
    return {x: x / magnitude, y: y / magnitude};
};

const radius = Number(process.env.PLAYER_RADIUS);
const checkCollisions = (shot, states, socketId) => {
    for(const i in states){
        if(i === socketId) continue;
        const state = states[i];
        if(shot.position.x <= state.x + radius
            && shot.position.x >= state.x - radius
            && shot.position.y <= state.y + radius
            && shot.position.y >= state.y - radius) {
            state.x = Math.floor(Math.random() * 600);
            state.y = Math.floor(Math.random() * 600);
            return true;
        }
    }
};

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
            if (checkY < process.env.BULLET_RADIUS || checkY > process.env.CANVAS_HEIGHT - process.env.BULLET_RADIUS) {
                //If bounces are done then remove, else decrease bounce
                if (shot.bounces === 0) {object.splice(index, 1); return;}
                shot.dir.y = -shot.dir.y;
                shot.bounces--;
            }

            if (checkX < process.env.BULLET_RADIUS || checkX > process.env.CANVAS_WIDTH - process.env.BULLET_RADIUS) {
                if (shot.bounces === 0) {object.splice(index, 1); return;}
                shot.dir.x = -shot.dir.x;
                shot.bounces--;
            }

            //Update positions
            shot.position.x += shot.dir.x * shot.x;
            shot.position.y += shot.dir.y * shot.y;

            const collision = checkCollisions(shot, states, i);
            if (collision) object.splice(index, 1);
        });
    }
};

module.exports = {initializePlayerCharacter, calculateDir, iterateShots};
