require('dotenv').config();

const StateMachine = require('javascript-state-machine');
const utils = require('./utils/utils');
const content = require('./content');

// State machine to control flow
// Documentation: https://github.com/jakesgordon/javascript-state-machine
const loggerFsm = '[fsm] ';
const Flow = (socket) => {
  const fsm = new StateMachine({
    init: 'init',
    transitions: [
      { name: 'start', from: 'init', to: 'idle' },
      // To step through the flow
      { name: 'step', from: 'idle', to: 'fault' },
      { name: 'step', from: 'fault', to: 'action' },
      { name: 'step', from: 'action', to: 'maintenance-in-progress' },
      { name: 'step', from: 'maintenance-in-progress', to: 'maintenance-done' },
      { name: 'step', from: 'maintenance-done', to: 'idle' },
      // To reset anytime
      { name: 'reset', from: '*', to: 'idle' },
      { name: 'stop', from: '*', to: 'init' },
    ],
    methods: {
      onEnterState: (lifecycle) => {
        console.log(`${loggerFsm} --- STATE: ${lifecycle.to}`);
      },
      onIdle: (lifecycle) => {
        // Reset
        socket.emit('fault', false);
        socket.send({ text: content.idle.text.join('<br>') });

        // Keep checking for fault
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onFault: (lifecycle) => {
        // Fault
        socket.emit('fault', true);
        // TURN OFF THE SOUND HERE
        // socket.emit('sound', true);
        socket.send({
          text: content.fault.text.join(' '),
          choices: true, // OK and Cancel options
        });

        // Wait for response
        socket.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
        socket.once('Cancel', () => lifecycle.fsm.reset()); // Back to 'idle'
      },
      onLeaveFault: (lifecycle) => {
        socket.emit('sound', false);
      },
      onAction: (lifecycle) => {
        socket.send({
          text: content.action.text.join('<br>'),
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onMaintenanceInProgress: (lifecycle) => {
        socket.send({
          text: content.maintenanceInProgess.text.join('<br>'),
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onMaintenanceDone: (lifecycle) => {
        socket.emit('fault', false);
        socket.send({
          text: content.maintenanceDone.text.join('<br>'),
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
    },
  });
  return { fsm };
};
module.exports = Flow;
