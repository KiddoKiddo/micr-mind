const StateMachine = require('javascript-state-machine');
const twx = require('./utils/twx');

// State machine to control flow
// Documentation: https://github.com/jakesgordon/javascript-state-machine
const loggerFsm = '[fsm] ';
const flow = emittor => new StateMachine({
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
      emittor.emit('fault', false);
      emittor.send({ text: 'The Production Line is running at the optimal level currently.' });

      // Keep checking for fault
      const interval = setTimeout(async () => {
        // const isFault = await twx.isLineRunning();
        // const isFault = false;
        // if (isFault) {
        //   clearInterval(interval);
        lifecycle.fsm.step();
        // }
      }, 5000);
    },
    onFault: (lifecycle) => {
      // Fault
      emittor.emit('fault', true);
      emittor.send({
        text: 'Conveyor belt at Station #1 is not working! Do you want to solve the issue?',
        choices: true, // OK and Cancel options
      });

      // Wait for response
      emittor.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
      emittor.once('cancel', () => lifecycle.fsm.reset()); // Back to 'idle'
    },
    onAction: (lifecycle) => {
      emittor.send({
        text: 'Creating a Maintenance Work Order for the issue.\nReschedule.\nContact personel via email.',
      });
      setTimeout(async () => {
        lifecycle.fsm.step(); // To 'maintainance-in-progress'
      }, 5000);
    },
    onMaintainanceInProgress: (lifecycle) => {
      setTimeout(async () => {
        lifecycle.fsm.step();
      }, 5000);
    },
    onMaintainanceDone: (lifecycle) => {
      setTimeout(async () => {
        lifecycle.fsm.step();
      }, 5000);
    },
  },
});


module.exports = flow;
