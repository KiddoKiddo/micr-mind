require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');
const Mind = require('./Mind.js');

// To serve the react app build
app.use(express.static(`${__dirname}/../build`));
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '../build/index.html'));
});

const clients = {};

// To init the socket io connection
// Socket io connection for Mind UI
io.of('/mind')
  .on('connection', (socket) => {
    const logger = '[mind] ';
    console.log(`${logger} *** a client connected`);

    // Init Mind for each socket client
    const mind = Mind(socket);

    // Store clients
    clients[socket.id] = mind;

    // To start flow
    socket.on('start', () => mind.fsm.reset());
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
    // // Transmit message to 'mind' client
    // socket.on('send-to-mind', (data) => {
    //   try {
    //     const data_json = JSON.parse(data);
    //
    //     // Emit to mind if data is JSON structured.
    //     const event = data_json.event || 'message';
    //     const data_to_be_sent = data_json.data || '';
    //     mind.emit(event, data_to_be_sent);
    //   } catch (e) {
    //     mind.emit('message', data);
    //   }
    // });

    // To update current status to 'control' client
    // setInterval(() => io.emit('status', { state: flow.state }), 3000);
  });

// Start express server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Listening on *:3000');
});
