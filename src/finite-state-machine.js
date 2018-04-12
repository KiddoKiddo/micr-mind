const StateMachine = require('javascript-state-machine');

const twx = require('./utils/twx');

// State machine to control flow
const loggerFsm = '[fsm] ';
const fsm = new StateMachine({
  init: 'init',
  transitions: [
    { name: 'start', from: 'init', to: 'idle' },
    { name: 'toFault', from: 'idle', to: 'fault' },
    { name: 'toAction', from: 'fault', to: 'action' },
    { name: 'toIdle', from: 'action', to: 'idle' },
  ],
  methods: {
    onEnterState: (lifecycle) => {
      console.log(`${loggerFsm} --- STATE: `, lifecycle.to);
    },
    onIdle: () => {
      const interval = setInterval(async () => {
        const isFault = await twx.isLineRunning();
        if (isFault) {
          clearInterval(interval);
          fsm.toFault(); // Change to 'fault' state
        }
      }, 1000);
    },
    onFault: () => {

    },
    onAction: () => {

    },
  },
});

module.exports = fsm;
