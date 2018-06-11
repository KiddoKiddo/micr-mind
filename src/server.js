require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');
const rm = require('./utils/random-messages');
const Flow = require('./Flow.js');

const IS_PRODUCTION = process.env.ENV === 'PRODUCTION';
const IS_TIMEOUT = process.env.TIMEOUT === 'true';
const IS_SOUND = process.env.SOUND === 'true';
const SCAN_RATE = process.env.SCAN_RATE || 1000;

// To serve the react app build
app.use(express.static(`${__dirname}/../build`));
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '../build/index.html'));
});

// To store the clients
const clients = {};

// To init the socket io connection
// Socket io connection for Mind UI
io.of('/mind')
  .on('connection', (socket) => {
    const logger = '[mind] ';
    console.log(`${logger} *** a client connected`);

    // Shoot random message
    const randMsg = rm.scheduleRandomMessages(socket);

    // Init Flow for each socket client
    const flow = new Flow(socket, randMsg);

    // Store clients
    clients[socket.id] = flow;

    // Some common even to handle through out the app
    socket.on('open_app', (msg) => {
      const url = msg.label || 'www.google.com';
      const pos = msg.position || 1;
      if (IS_PRODUCTION) nc.placeApp(url, pos);
    });

    // To delete once the client disconnects
    socket.on('disconnect', () => delete clients[socket.id]);
  });

// Socket io connection for manual control state machine
// To simulate the effect of events happened
const METHODS = ['step', 'toInit', 'toIdle', 'reload'];
io.of('/control')
  .on('connection', (socket) => {
    const logger = '[control] ';
    let latestId;

    console.log(`${logger}***  a controller connected`);

    socket.emit('clients', { clients: Object.keys(clients) });
    socket.on('clients', () => socket.emit('clients', { clients: Object.keys(clients) }));

    socket.on('control', (options) => {
      const id = options.id;
      const method = options.method;

      if (!io.of('mind').sockets[id]) {
        // Notes: type follows bootstrap
        socket.send({ type: 'danger', text: `No client with id: ${id}` });
        socket.emit('clients', { clients: Object.keys(clients) });
      } else {
        if (options.method === 'reload') {
          io.of('mind').sockets[id].emit('reload');
          // Update new client id
          setTimeout(() => socket.emit('clients', { clients: Object.keys(clients) }), 1000);
        } else {
          clients[id].method(method);
        }
        emitState(id);
      }
    });

    socket.on('state', (data) => {
      if (io.of('mind').sockets[data.id]) emitState(data.id);
    });
    const emitState = id => socket.emit('state', { state: clients[id].fsm.state });
  });

// Start express server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Listening on *:', port);
});
