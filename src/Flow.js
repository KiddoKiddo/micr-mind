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
    this.WOName = 'WO-17/8-5';
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
        // To step back the flow
        { name: 'back', from: 'task', to: 'idle' },
        { name: 'back', from: 'fault', to: 'task' },
        { name: 'back', from: 'action', to: 'fault' },
        { name: 'back', from: 'maintenance-in-progress', to: 'action' },
        { name: 'back', from: 'maintenance-done', to: 'maintenance-in-progress' },
        { name: 'back', from: 'idle', to: 'maintenance-done' },
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
          randMsg.resume(); // If it ever pause before
        },
        // ==========================Idle================================
        onIdle: (lifecycle) => {
          socket.send(content.idle);
          socket.emit('fault', false); // Reset fault
          socket.emit('btn', false);

          if (IS_PRODUCTION) nc.placeApp('AGV Controller', 5);
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

          // Remove AGV
          nc.removeWindshield('AGV Controller');

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
          if (IS_PRODUCTION) nc.placeApp('PlantSim', 8);
        },
        // ==========================Action================================
        onAction: async (lifecycle) => {
          socket.send({ text: ['Creating a Maintenance Work Order...'] });

          // Create WO TWX
          this.WOName = await twx.executeService('AGV_Arcstone_Demo', 'CreateWO');
          console.log(`${loggerFsm} Create WO: ${this.WOName}`);

          // Send content to UI
          content.action.text.splice(0, 1, `Maintenance Work Order created: ${this.WOName}`);
          socket.send(content.action);

          // When the maintenance is in progress
          this.interval = setInterval(async () => {
            if (IS_TIMEOUT || await twx.getProperty('AGV_Arcstone_Demo', 'StartWO')) {
              clearInterval(this.interval);
              lifecycle.fsm.step();
            }
          }, SCAN_RATE);
        },
        onActionLeave: lifecycle => clearInterval(this.interval),
        // ==========================MIP================================
        onMaintenanceInProgress: async (lifecycle) => {
          // Text to UI
          socket.send(content.maintenanceInProgess);

          // When the maintenance is done
          this.interval = setInterval(async () => {
            if (IS_TIMEOUT || await twx.getProperty('AGV_Arcstone_Demo', 'FinishWO')) {
              clearInterval(this.interval);
              lifecycle.fsm.step();
            }
          }, SCAN_RATE);
        },
        onMaintenanceInProgressLeave: lifecycle => clearInterval(this.interval),
        // ==========================MD================================
        onMaintenanceDone: async (lifecycle) => {
          // Text UI
          content.maintenanceDone.text.splice(0, 1, `Maintenance Work Order ${this.WOName} ID: is completed.`);
          socket.send(content.maintenanceDone);

          // Reset blink
          socket.emit('fault', false);

          // Resume random message
          randMsg.sendSpecialMessage('agv-ok');
          randMsg.resume();
        },
      },
    });

    this.method = (method) => {
      if (this.fsm.can(method)) this.fsm[method]();
    };
  }
}
module.exports = Flow;
