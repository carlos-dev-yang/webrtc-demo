import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

class App {
  app: express.Application;

  constructor() {
    this.app = express();
  }
}

const app = new App().app;

app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('connection established', socket);
  socket.on('socket on data', (data) => {
    io.emit('socket on data', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
app.listen(8080, () => {
  console.log('Started server with 8080');
});

// const getApiAndEmit = (socket: unknown) => {
//   const response = 'response you need';
//   socket.emit('FromAPI', response);
// };

// app.get('/', (req: express.Request, res: express.Response) => {
//   res.send('Hello');
// });
