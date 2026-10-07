const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();       // socketId -> username
const messages = [];           // последние 100 сообщений

io.on('connection', (socket) => {
  console.log('connect:', socket.id);

  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.emit('history', messages);
    io.emit('users', [...users.values()]);
    io.emit('system', `${username} присоединился`);
  });

  socket.on('message', (text) => {
    const username = users.get(socket.id) || 'Аноним';
    const msg = { username, text, time: Date.now() };
    messages.push(msg);
    if (messages.length > 100) messages.shift();
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    if (username) io.emit('system', `${username} вышел`);
    io.emit('users', [...users.values()]);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`ROBBA запущен на порту ${PORT}`));