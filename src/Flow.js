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

// Log all important env
console.log(`IS_PRODUCTION: ${IS_PRODUCTION}`);
console.log(`IS_TIMEOUT: ${IS_TIMEOUT}`);
console.log(`IS_SOUND: ${IS_SOUND}`);

// State machine to control flow
// Documentation: https://github.com/jakesgordon/javascript-state-machine
const loggerFsm = '[fsm] ';
class Flow {

  constructor(socket, randMsg) {
    this.fsm = new StateMachine({
      init: 'init',
      transitions: [
        // To step through the flow
        { name: 'step', from: 'init', to: 'idle' },
        { name: 'step', from: 'idle', to: 'task' },
        { name: 'step', from: 'task', to: 'fault' },
        { name: 'step', from: 'fault', to: 'action' },
        { name: 'step', from: 'action', to: 'maintenance-in-progress' },
        { name: 'step', from: 'maintenance-in-progress', to: 'maintenance-done' },
        { name: 'step', from: 'maintenance-done', to: 'idle' },
        // To reset anytime to either 'idle' 'init' 'task' 'fault'
        { name: 'toIdle', from: '*', to: 'idle' },
        { name: 'toInit', from: '*', to: 'init' },
        { name: 'toTask', from: '*', to: 'task' },
        { name: 'toFault', from: '*', to: 'fault' },
      ],
      methods: {
        onEnterState: (lifecycle) => {
          console.log(`${loggerFsm} --- STATE: ${lifecycle.to}`);
        },
        // ==========================Init================================
        onInit: (lifecycle) => {
          // TODO: Why onInit enter two times
          socket.send(content.init);
          socket.emit('fault', false); // Reset fault
        },
        // ==========================Idle================================
        onIdle: (lifecycle) => {
          socket.send(content.idle);
          socket.emit('fault', false); // Reset fault
          socket.emit('btn', false);
        },
        // ==========================Task================================
        onTask: (lifecycle) => {
          socket.send(content.task);

          // Show AGV map (Quuppa)
          if (IS_PRODUCTION) nc.placeApp('QUUPPA', 7);
        },
        // ==========================Fault================================
        onFault: (lifecycle) => {
          // Text to UI
          socket.send(content.fault);

          // UI control
          socket.emit('fault', true);
          if (IS_SOUND) socket.emit('sound', true);
          socket.emit('btn', true);

          // Pause random msg
          randMsg.pause();
          randMsg.sendSpecialMessage('agv-fault');

          // Wait for response
          socket.once('OK', () => lifecycle.fsm.step()); // Go to 'action'
          socket.once('Cancel', () => lifecycle.fsm.toIdle()); // Back to 'idle'
        },
        // Turn off sound
        onLeaveFault: (lifecycle) => {
          socket.emit('sound', false); // Turn off the sound
        },
        // ==========================Action================================
        onAction: async (lifecycle) => {
          // Create WO TWX
          let WOName = 'WO#####';
          if (IS_PRODUCTION) {
            WOName = await twx.executeService('AGV_Arcstone_Demo', 'CreateWO');
          }
          console.log(`${loggerFsm} Create WO: ${WOName}`);

          // Send content to UI
          content.action.text.splice(0, 1, `Create maintenance WO: ${WOName}`);
          socket.send(content.action);

          // When the maintenance is in progress
          this.interval = setInterval(async () => {
            if (IS_TIMEOUT || await twx.getProperty('AGV_Arcstone_Demo', 'StartWO')) {
              lifecycle.fsm.step();
              clearInterval(this.interval);
            }
          }, SCAN_RATE);
        },
        onActionLeave: lifecycle => clearInterval(this.interval),
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
        onMaintenanceInProgressLeave: lifecycle => clearInterval(this.interval),
        // ==========================MD================================
        onMaintenanceDone: async (lifecycle) => {
          let WOName = 'WO#####';
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

          // Resume random message
          randMsg.sendSpecialMessage('agv-ok');
          randMsg.resume();
        },
      },
    });

    this.method = method => this.fsm[method]();
  }
}
module.exports = Flow;
