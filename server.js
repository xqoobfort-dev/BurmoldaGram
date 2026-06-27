const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true
});

app.use(express.static(path.join(__dirname, 'public')));

// Хранилище последних 50 сообщений в памяти
const messageHistory = [];

io.on('connection', (socket) => {
    // При подключении отправляем историю чата новому пользователю
    socket.emit('chat-history', messageHistory);

    // Обработка нового сообщения
    socket.on('send-message', (data) => {
        const messageData = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            username: data.username || 'Anonymous',
            avatar: data.avatar || 'https://hiclipart.com',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        messageHistory.push(messageData);
        if (messageHistory.length > 50) messageHistory.shift(); // Ограничиваем историю

        io.emit('receive-message', messageData);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
