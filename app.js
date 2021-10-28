const express = require('express');
const app = express();
require('dotenv').config();
const server = require('https').createServer(app);
const helper = require('./server/helper');
const Player = require('./server/player');
const Lobby = require('./server/lobby');
const game = require('./server/game');
const {uniqueNamesGenerator, adjectives, animals} = require('unique-names-generator');
const {Server} = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const io = new Server(server);

const SOCKET_LIST = {};
const LOBBY_LIST = {};
const MAX_LOBBIES = 2;

const initializeLobbies = () => {
    for (let i = 0; i < 2; i++) {
        LOBBY_LIST[i] = new Lobby(i, {}, {}, {});
    }
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

setInterval(function(){
    for (const i in LOBBY_LIST){
        io.to(i).emit('update positions', LOBBY_LIST[i].position);
    }
}, 1/60);

io.on('connection', async (socket) => {
    //Generate unique id for socket
    const socketId = uuidv4();
    //Generate random name
    const name = uniqueNamesGenerator({dictionaries: [adjectives, animals]}).replace("_", " ");
    //Get random lobby id
    const lobbyId = helper.getRandomInt(MAX_LOBBIES);
    //Join room
    await socket.join(lobbyId.toString());

    const currentLobby = LOBBY_LIST[lobbyId];

    //Update lists
    SOCKET_LIST[socketId] = socket;
    currentLobby.players[socketId] = new Player(name, socketId, Date.now());
    currentLobby.position[socketId] = new helper.Vector2(0, 0);

    console.log(`${name} connected to lobby ${lobbyId}!`);

    socket.on('move right', () => {
        currentLobby.position[socketId].x += 1;
    });

    socket.on('move left', () => {
        currentLobby.position[socketId].x -= 1;
    });

    socket.on('move up', () => {
        currentLobby.position[socketId].y -= 1;
    });

    socket.on('move down', () => {
        currentLobby.position[socketId].y += 1;
    });

    socket.on('chat message', (msg) => {
        const msgWithUser = `${name}: ${msg}`;

        io.to(lobbyId.toString()).emit('add to chat', msgWithUser);
    });

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socketId];
        delete currentLobby.players[socketId];
        delete currentLobby.position[socketId];
    });

});

app.use(express.static('client'));

server.listen(process.env.PORT, () => {
    initializeLobbies();
    console.log('listening on *:3000');
});
