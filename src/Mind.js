require('dotenv').config();

const StateMachine = require('javascript-state-machine');
const utils = require('./utils/utils');

// State machine to control flow
// Documentation: https://github.com/jakesgordon/javascript-state-machine
const loggerFsm = '[fsm] ';
const Mind = (socket) => {
  const fsm = new StateMachine({
    init: 'init',
    transitions: [
      { name: 'start', from: 'init', to: 'idle' },
      // To step through the flow
      { name: 'step', from: 'idle', to: 'fault' },
      { name: 'step', from: 'fault', to: 'action' },
      { name: 'step', from: 'action', to: 'maintainance-in-progress' },
      { name: 'step', from: 'maintainance-in-progress', to: 'maintainance-done' },
      { name: 'step', from: 'maintainance-done', to: 'idle' },
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
        socket.send({ text: 'The Production Line is running at the optimal level currently.' });

        // Keep checking for fault
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onFault: (lifecycle) => {
        // Fault
        socket.emit('fault', true);
        socket.send({
          text: 'Conveyor belt at Station #1 is not working! Do you want to solve the issue?',
          choices: true, // OK and Cancel options
        });

        // Wait for response
        socket.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
        socket.once('Cancel', () => lifecycle.fsm.reset()); // Back to 'idle'
      },
      onAction: (lifecycle) => {
        socket.send({
          text: 'Creating a Maintenance Work Order for the issue.<br>Reschedule.<br>Contact personel via email.',
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onMaintainanceInProgress: (lifecycle) => {
        socket.send({
          text: 'Maintenance of conveyor belt at #Station 1 is in progress (W.O ID xx)',
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
      onMaintainanceDone: (lifecycle) => {
        socket.emit('fault', false);
        socket.send({
          text: 'Maintenance W.O ID xx is completed and the issue is solved.The production resumed back to normal. Due to the timely intervention, the on-time delivery schedule is not affected.',
        });
        if (process.env.TIMEOUT) setTimeout(() => lifecycle.fsm.step(), 5000);
      },
    },
  });
  return { fsm };
};
module.exports = Mind;
