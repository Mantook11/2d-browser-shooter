class Player {
    constructor(name, socketId, joinTime, shotCooldown) {
        this.name = name;
        this.socketId = socketId;
        this.joinTime = joinTime;
        this.shotCooldown = shotCooldown;
    }
}

module.exports = Player;
