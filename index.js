import http from 'http'
import app from './app.js';
import short from 'short-uuid';

import { Server } from 'socket.io'

const port = process.env.PORT || 3000;

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})
const users = []
const rooms = []

const findbySocketid = (id) => {
    const res = Object.values(users).find((obj) => {
        return obj.socket_id === id
    })

    return res
}

io.on('connection', (socket) => {
    users[socket.handshake.query.user_id] = {
        socket_id: socket.id
    }
    socket.on('createRoom', ({ nickname }) => {
        users[socket.handshake.query.user_id] = {
            name: nickname,
        }
        socket.nickname = nickname
        const roomId = short.generate();
        console.log('created', roomId);
        rooms[roomId] = {
            members: [{
                id: socket.handshake.query.user_id,
                owner: true,
            }],

        }
        socket.join(roomId)
        io.to(roomId).emit('room_created', { roomId })
    })

    // socket.on('connec')

    socket.on('disconnect', () => {
        console.log(rooms);
        console.log(users)
        console.log(socket.handshake.query.user_id, ' ', socket.nickname, 'disconnected');
    })
})


server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})


