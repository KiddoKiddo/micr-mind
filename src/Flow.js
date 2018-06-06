require('dotenv').config();

const StateMachine = require('javascript-state-machine');
const nc = require('./utils/nervecenter');
const mir = require('./utils/mir');
const twx = require('./utils/twx');
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
      init: 'init',
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
        // ==========================Init================================
        onInit: (lifecycle) => {
          // TODO: Why onInit enter two times
          socket.send(content.init);
          // Reset fault
          socket.emit('fault', false);
        },
        // ==========================Idle================================
        onIdle: (lifecycle) => {
          socket.send(content.idle);

          // Check whether AGV in action
          const interval = setInterval(async () => {
            if (IS_TIMEOUT || await mir.isInAction()) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        // ==========================Task================================
        onTask: (lifecycle) => {
          socket.send(content.task);

          // Show AGV map (Quuppa)
          if (IS_PRODUCTION) nc.placeApp('QUUPPA', 7);

          // Check whether AGV in error
          const interval = setInterval(async () => {
            if (IS_TIMEOUT || await mir.isInDemoError()) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        // ==========================Fault================================
        onFault: (lifecycle) => {
          // Text to UI
          socket.send(content.fault);

          // Fault
          socket.emit('fault', true);

          // Alarm
          if (IS_SOUND) socket.emit('sound', true);

          // Wait for response
          socket.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
          socket.once('Cancel', () => lifecycle.fsm.reset()); // Back to 'idle'
        },
        // Turn off sound
        onLeaveFault: (lifecycle) => {
          socket.emit('sound', false); // Turn off the sound
        },
        // ==========================Action================================
        onAction: async (lifecycle) => {
          // Create WO TWX
          let WOName = 'WO-XXX-XXX';
          if (IS_PRODUCTION) {
            WOName = await twx.executeService('AGV_Arcstone_Demo', 'CreateWO');
          }
          console.log(`${loggerFsm} Create WO: ${WOName}`);

          // Send content to UI
          content.action.text.splice(0, 1, `Create maintenance WO: ${WOName}`);
          socket.send(content.action);

          // When the maintenance is in progress
          const interval = setInterval(async () => {
            if (IS_TIMEOUT || await twx.getProperty('AGV_Arcstone_Demo', 'StartWO')) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        // ==========================MIP================================
        onMaintenanceInProgress: async (lifecycle) => {
          // Text to UI
          socket.send(content.maintenanceInProgess);

          // When the maintenance is done
          const interval = setInterval(async () => {
            if (IS_TIMEOUT || await twx.getProperty('AGV_Arcstone_Demo', 'FinishWO')) {
              lifecycle.fsm.step();
              clearInterval(interval);
            }
          }, SCAN_RATE);
        },
        // ==========================MD================================
        onMaintenanceDone: async (lifecycle) => {
          let WOName = 'WO-XXX-XXX';
          // Delete the error demo
          if (IS_PRODUCTION) {
            await mir.deleteLatestExecuting();
            WOName = await twx.getProperty('AGV_Arcstone_Demo', 'CreateWOName');
          }

          // Text UI
          content.maintenanceDone.text.splice(0, 1, `Maintenance W.O ID: ${WOName} is completed.`);
          socket.send(content.maintenanceDone);

          // Reset blink
          socket.emit('fault', false);

          // Always
          setTimeout(() => lifecycle.fsm.step(), 10000);
        },
      },
    });

    this.nextState = () => {
      // TODO: Control by the control UI
    };
  }
}
module.exports = Flow;
