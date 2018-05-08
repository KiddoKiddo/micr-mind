require('dotenv').config();

const StateMachine = require('javascript-state-machine');
const nc = require('./utils/nervecenter');
const mir = require('./utils/mir');
const utils = require('./utils/utils');
const content = require('./content');

const IS_PRODUCTION = process.env.ENV === 'PRODUCTION';
const IS_TIMEOUT = process.env.TIMEOUT === 'true';
const IS_SOUND = process.env.SOUND === 'true';
const SCAN_RATE = process.env.SCAN_RATE || 1000;

// State machine to control flow
// Documentation: https://github.com/jakesgordon/javascript-state-machine
const loggerFsm = '[fsm] ';
class Flow {
  constructor(socket) {

    // Log all important env
    console.log(`IS_PRODUCTION: ${IS_PRODUCTION}`);
    console.log(`IS_TIMEOUT: ${IS_TIMEOUT}`);
    console.log(`IS_SOUND: ${IS_SOUND}`);

    this.fsm = new StateMachine({
      // init: 'init',
      transitions: [
        // To step through the flow
        { name: 'step', from: 'idle', to: 'task' },
        { name: 'step', from: 'task', to: 'fault' },
        { name: 'step', from: 'fault', to: 'action' },
        { name: 'step', from: 'action', to: 'maintenance-in-progress' },
        { name: 'step', from: 'maintenance-in-progress', to: 'maintenance-done' },
        { name: 'step', from: 'maintenance-done', to: 'idle' },
        // To reset anytime to either 'idle' 'init'
        { name: 'reset', from: '*', to: 'idle' },
        { name: 'stop', from: '*', to: 'init' },
      ],
      methods: {
        onEnterState: (lifecycle) => {
          console.log(`${loggerFsm} --- STATE: ${lifecycle.to}`);
        },
        onInit: (lifecycle) => {
          // TODO: Why onInit enter two times

        },
        onIdle: (lifecycle) => {
          socket.send(content.idle);

          // Reset fault
          socket.emit('fault', false);

          // Check whether AGV in action
          const interval = setInterval(async () => {
            if (!IS_PRODUCTION || IS_TIMEOUT || await mir.isInAction()) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        onTask: (lifecycle) => {
          socket.send(content.task);

          // Show AGV map (Quuppa)
          if (IS_PRODUCTION) nc.placeApp(process.env.QUUPPA_APP, 7);

          // Check whether AGV in error
          const interval = setInterval(async () => {
            if (!IS_PRODUCTION || await mir.isInStagingError()) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        onFault: (lifecycle) => {
          socket.send(content.fault);

          // Fault
          socket.emit('fault', true);

          // Alarm
          if (IS_SOUND) socket.emit('sound', true);

          // Show Quuppa
          if (IS_PRODUCTION) nc.placeApp('QUUPPA', 7);

          // Wait for response
          socket.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
          socket.once('Cancel', () => lifecycle.fsm.reset()); // Back to 'idle'
        },
        // Turn off sound
        onLeaveFault: (lifecycle) => {
          socket.emit('sound', false);
        },
        onAction: (lifecycle) => {
          socket.send(content.action);

          // TODO: How to know when the maintenance is in progress
          if (IS_TIMEOUT) setTimeout(() => lifecycle.fsm.step(), SCAN_RATE);
        },
        onMaintenanceInProgress: (lifecycle) => {
          // TODO: WO ID from TWX
          socket.send(content.maintenanceInProgess);

          // TODO: Maintenance done check
          if (IS_TIMEOUT) setTimeout(() => lifecycle.fsm.step(), SCAN_RATE);
        },
        onMaintenanceDone: (lifecycle) => {
          socket.send(content.maintenanceDone);
          // Reset blink
          socket.emit('fault', false);

          if (IS_TIMEOUT) setTimeout(() => lifecycle.fsm.step(), SCAN_RATE);
        },
      },
    });
  }
}
module.exports = Flow;
