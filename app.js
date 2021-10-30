require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const server = require('http').createServer(app);
const helper = require('./server/helper');
const Player = require('./server/player');
const Lobby = require('./server/lobby');
const game = require('./server/game');
const {uniqueNamesGenerator, adjectives, animals} = require('unique-names-generator');
const {Server} = require('socket.io');
const {v4: uuidv4} = require('uuid');
const io = new Server(server);

const SOCKET_LIST = {};
const LOBBY_LIST = {};
const MAX_LOBBIES = 1;

const initializeLobbies = () => {
    for (let i = 0; i < MAX_LOBBIES; i++) {
        LOBBY_LIST[i] = new Lobby(i, {}, {}, {}, {});
    }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.get('/', (req, res, next) => {
    const cookies = req.cookies;
    if (cookies['name'] === undefined) {
        res.sendFile(__dirname + '/client/landing.html');
    } else {
        next();
    }
});

app.post('/', (req, res, next) => {
    const cookies = req.cookies;
    if (cookies['name'] === undefined) {
        next();
    } else {
        res.redirect('/');
    }
});

app.post('/', (req, res) => {
    if (req.body.name) {
        res.cookie('name', req.body.name, {maxAge: 900000});
    } else {
        const randomName = uniqueNamesGenerator({dictionaries: [adjectives, animals]}).replace("_", " ");
        res.cookie('name', randomName, {maxAge: 900000});
    }
    res.sendFile(__dirname + '/client/index.html');
});

app.use(express.static('client'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

setInterval(function () {
    for (const i in LOBBY_LIST) {
        io.to(i).emit('heartbeat');
        game.iterateShots(LOBBY_LIST[i].shots, LOBBY_LIST[i].state);
        io.to(i).emit('update shots', LOBBY_LIST[i].shots);
        io.to(i).emit('update player', LOBBY_LIST[i].state);
    }
}, 10);

io.on('connection', async (socket) => {
    //Generate unique id for socket
    const socketId = uuidv4();

    socket.on('set name', (name) => {
        main(name);
    });

    const main = async (name) => {
        //Get random lobby id
        const lobbyId = helper.getRandomInt(MAX_LOBBIES);
        //Join room
        await socket.join(lobbyId.toString());

        const currentLobby = LOBBY_LIST[lobbyId];

        //Update lists
        SOCKET_LIST[socketId] = socket;
        currentLobby.players[socketId] = new Player(name, socketId, Date.now());
        currentLobby.state[socketId] = new helper.State(200, 200, name);
        currentLobby.shots[socketId] = [];

        console.log(`${name} connected to lobby ${lobbyId}!`);

        socket.on('action1', (mousePos) => {
            const initialLocation = {x: currentLobby.state[socketId]['x'], y: currentLobby.state[socketId]['y']};
            const dir = game.calculateDir(initialLocation, mousePos);
            currentLobby.shots[socketId].push({position: initialLocation, dir, x: 6, y: 6, bounces: 2});
        });

        socket.on('move right', () => {
            if (currentLobby.state[socketId].x + 2 < process.env.CANVAS_WIDTH - process.env.PLAYER_RADIUS) {
                currentLobby.state[socketId].x += 2;
            }

        });

        socket.on('move left', () => {
            if (currentLobby.state[socketId].x - 2 > process.env.PLAYER_RADIUS) {
                currentLobby.state[socketId].x -= 2;
            }
        });

        socket.on('move up', () => {
            if (currentLobby.state[socketId].y - 2 > process.env.PLAYER_RADIUS) {
                currentLobby.state[socketId].y -= 2;
            }
        });

        socket.on('move down', () => {
            if (currentLobby.state[socketId].y + 2 < process.env.CANVAS_HEIGHT - process.env.PLAYER_RADIUS) {
                currentLobby.state[socketId].y += 2;
            }
        });

        socket.on('chat message', (msg) => {
            const msgWithUser = `${name}: ${msg}`;

            io.to(lobbyId.toString()).emit('add to chat', msgWithUser);
        });

        socket.on('disconnect', () => {
            delete SOCKET_LIST[socketId];
            delete currentLobby.players[socketId];
            delete currentLobby.state[socketId];
        });
    };

});

server.listen(process.env.PORT, () => {
    initializeLobbies();
    console.log('listening on *:3000');
});
