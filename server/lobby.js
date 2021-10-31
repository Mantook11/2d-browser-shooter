class Lobby {
    constructor(id, players, scores, state, shots) {
        this.id = id;
        this.players = players;
        this.scores = scores;
        this.state = state;
        this.shots = shots;
    }
}

module.exports = Lobby;
