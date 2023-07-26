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
/*
rooms = [
roomID:{
    owner:user_id,
    members:[
        {
            id:user_id,
            owner:true,
            nickname:nickname
        }
    ],
    players:[
        {
            id:user_id,
            team:team,
            role:role,
            name:name
        }
    ],
    teamData:{
        turn: red | blue,
        red:{
            wordsLeft:wordsLeft,
            hint:hint,
            hintCount:hintCount,
        },
        blue:{
            wordsLeft:wordsLeft,
            hint:hint,
            hintCount:hintCount,
        }
    }
}


]

*/
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
    socket.on('createRoom', ({ name }) => {
        users[socket.handshake.query.user_id] = {
            name: name,
        }
        socket.nickname = name
        const roomId = short.generate();
        console.log('created', roomId);
        rooms[roomId] = {
            owner: socket.handshake.query.user_id,
            members: [{
                id: socket.handshake.query.user_id,
                owner: true,
                name: name
            }],
            players: [],
            teamData: {}

        }
        socket.join(roomId)
        socket.roomID = roomId
        io.to(roomId).emit('room_created', { roomId, members: rooms[roomId].members })
    })

    socket.on('joinRoom', ({ name, roomId }) => {
        console.log(name, roomId);
        users[socket.handshake.query.user_id] = {
            name: name,
        }
        socket.nickname = name
        rooms[roomId].members.push({
            id: socket.handshake.query.user_id,
            owner: false,
            name: name,
        })
        socket.join(roomId);
        socket.roomID = roomId
        io.to(roomId).emit('room_joined', { roomId, members: rooms[roomId].members })
    })

    socket.on('join_team', (data) => {
        console.log(data);
        rooms[socket.roomID].players.push({
            id: socket.handshake.query.user_id,
            team: data.team,
            role: data.role,
            name: socket.nickname
        })
        io.to(socket.roomID).emit('joined_team', rooms[socket.roomID].players)
    })

    socket.on('start_game',()=>{
        io.to(socket.roomID).emit('game_started',rooms[socket.roomID].teamData)
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


