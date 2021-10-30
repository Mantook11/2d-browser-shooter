socket.emit('initialize drawing', currentLobby.drawings);

socket.on('clear drawings', () => {
    currentLobby.drawings.length = 0;
    io.to(lobbyId.toString()).emit('initialize drawing', currentLobby.drawings);
});

socket.on('action1', () => {
    const obj = {x: currentLobby.state[socketId].x, y: currentLobby.state[socketId].y};
    currentLobby.drawings.push(obj);
    io.to(lobbyId.toString()).emit('update drawing', obj);
});