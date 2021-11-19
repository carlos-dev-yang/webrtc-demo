import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketRoom, Users } from './type';

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const users: Users = {};
const socketToRoom: SocketRoom = {};
const maximum = 2;

io.on('connection', (socket) => {
  console.log('connection established');

  socket.emit('hello', 'world');

  socket.on('join_room', (data) => {
    if (users[data.room]) {
      const length = users[data.room].length;
      if (length === maximum) {
        socket.to(socket.id).emit('room_full');
        return;
      }
      users[data.room].push({ id: socket.id, email: data.email });
    } else {
      users[data.room] = [{ id: socket.id, email: data.email }];
    }
    socketToRoom[socket.id] = data.room;

    socket.join(data.room);
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

    // 본인을 제외한 같은 room의 user array
    const usersInThisRoom = users[data.room].filter(
      (user) => user.id !== socket.id
    );

    console.log(usersInThisRoom);

    io.sockets.to(socket.id).emit('all_users', usersInThisRoom);
  });

  socket.on('offer', (sdp) => {
    console.log('offer: ' + socket.id);
    socket.broadcast.emit('getOffer', sdp);
  });

  socket.on('answer', (sdp) => {
    console.log('answer: ' + socket.id);
    socket.broadcast.emit('getAnswer', sdp);
  });

  socket.on('candidate', (candidate) => {
    console.log('candidate: ' + socket.id);
    socket.broadcast.emit('getCandidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
    // disconnect한 user가 포함된 roomID
    const roomID = socketToRoom[socket.id];
    // room에 포함된 유저
    let room = users[roomID];
    // room이 존재한다면(user들이 포함된)
    if (room) {
      // disconnect user를 제외
      room = room.filter((user) => user.id !== socket.id);
      users[roomID] = room;
    }
    // 어떤 user가 나갔는 지 room의 다른 user들에게 통보
    socket.broadcast.to(roomID).emit('user_exit', { id: socket.id });
    console.log(users);
  });
});

httpServer.listen(8080);
