class Lobby {
    constructor(id, players, scores, state, drawings) {
        this.id = id;
        this.players = players;
        this.scores = scores;
        this.state = state;
        this.drawings = drawings;
    }
}

module.exports = Lobby;
