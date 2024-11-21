const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const cookies = require('cookie-parser');
const http = require('http');
const app = express();
const { Server } = require("socket.io");

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookies());
app.use(express.json());

const Router = require('./router');
app.use('/', Router);

//MongoDB credentials
//username:mastropierrovale password:VpHUHsndQyzMnPEk
function connectionDB() {
    try {
        console.log('connecting to MongoDB')
        mongoose.connect(process.env.MONGODB_URI)
        console.log("Connesso al DB");
    } catch (err) {
        console.error("error connecting to MongoDB", err);
    }
}

connectionDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Modifiche al codice Socket.io nel server
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_group', (groupId) => {
        if (!groupId) {
            console.error(`User ${socket.id} attempted to join a null or undefined group`);
            socket.emit('error', 'Group ID is required to join a group');
            return;
        }

        console.log(`User with ID: ${socket.id} joined group: ${groupId}`);
        socket.join(groupId);
    });

    socket.on('send_message', (data) => {
        const { groupId, message, username } = data;
    
        // Verifica che l'utente sia effettivamente nella stanza
        if (!socket.rooms.has(groupId)) {
            console.error(`User ${socket.id} is not in group ${groupId}`);
            socket.emit('error', 'User is not in the group');
            return;
        }
    
        const timestamp = new Date();
        console.log(`Sending message to group ${groupId}:`, data);
        io.to(groupId).emit('receive_message', { message, username, timestamp });
    });
    

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(5000, () => { console.log('Server in ascolto sulla porta 5000') });
