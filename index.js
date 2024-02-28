// testSocketIO.js
const io = require('socket.io-client');

// Connect to the Socket.IO server
const socket = io('http://localhost:8000');

const commandLineArgs = process.argv.slice(2);

socket.on('connect', () => {
    socket.emit('register', 'WE', commandLineArgs[0]);
});

socket.on('client_connected', (data) => {
  console.log('Client connected successfully');
});

// Event handler for the 'notification' event
socket.on('send_notification', (data) => {
  console.log('Received notification:', data);
});