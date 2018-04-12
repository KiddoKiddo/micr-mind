const express = require('express');
const path = require('path');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const fsm = require('./finite-state-machine');
const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');

// To serve the react app build
app.use(express.static(`${__dirname}/../build`));
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '../build/index.html'));
});

// To serve the test page
app.use(express.static('server/tests/'));

// To init the socket io connection
// Socket io connection for Mind UI
const mind = io
  .of('/mind')
  .on('connection', (socket) => {
    const logger = '[mind] ';
    console.log(`${logger} *** a client connected`);
  });

// Socket io connection for manual control state machine
// To simulate the effect of events happened
const control = io
  .of('/control')
  .on('connection', (socket) => {
    const logger = '[control] ';
    console.log(`${logger}***  a client connected`);

    socket.on('start', () => {
      fsm.start();
    });

    // Manually trigger events
    // TODO: trigger other events too
    socket.on('trigger', (msg) => {
      console.log(`${logger} Trigger fault`);
      if (fsm.can('toFault')) {
        fsm.toFault();
      } else {
        socket.emit('message', { state: fsm.state, msg: 'fsm cannot transit to "fault" state' });
      }
    });

    // Transmit message to 'mind' client
    socket.on('transmit', (msg) => { mind.emit('message', msg); });

    // To test the twx
    socket.on('twx', async (method) => {
      const result = await twx[method]();
      socket.emit('message', result);
    });

    // To update current status to 'control' client
    // setInterval(() => io.emit('status', { state: fsm.state }), 3000);
  });

// Observe state machine to inform client
fsm.observe('onFault', () => {
  mind.emit('message', 'Fault detected.');
});


// Start express server
http.listen(process.env.PORT || 3000, () => {
  console.log('Listening on *:3000');
});
