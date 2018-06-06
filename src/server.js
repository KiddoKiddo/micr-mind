require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');
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

    // Init Flow for each socket client
    const flow = new Flow(socket);

    // Store clients
    clients[socket.id] = flow;

    // To start flow
    socket.on('start', () => flow.fsm.reset());

    // Some common even to handle through out the app
    socket.on('open_app', (msg) => {
      console.log(msg);
      const url = msg.label || 'www.google.com';
      const pos = msg.position || 1;
      if (IS_PRODUCTION) nc.placeApp(url, pos);
    });

    // To update current status to 'control' client
    setInterval(() => socket.emit('flowState', { state: flow.state }), 5000);
  });

// Socket io connection for manual control state machine
// To simulate the effect of events happened
const control = io
  .of('/control')
  .on('connection', (socket) => {
    const logger = '[control] ';
    console.log(`${logger}***  a client connected`);

    // // Assume first client
    //
    // // To stop
    // socket.on('stop', () => flow.stop()); // To 'init'
    //
    // // To start flow
    // socket.on('start', () => flow.reset()); // To 'idle'
    //
    // // Transmit message to 'Flow' client
    // socket.on('send-to-Flow', (data) => {
    //   try {
    //     const data_json = JSON.parse(data);
    //
    //     // Emit to Flow if data is JSON structured.
    //     const event = data_json.event || 'message';
    //     const data_to_be_sent = data_json.data || '';
    //     Flow.emit(event, data_to_be_sent);
    //   } catch (e) {
    //     Flow.emit('message', data);
    //   }
    // });
  });

// Start express server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Listening on *:', port);
});
