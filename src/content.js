module.exports = {
  init: {
    text: [
      'Overall production is running as per normal',
    ],
  },
  idle: {
    text: [
      'Overall production is running as per normal',
    ],
  },
  task: {
    text: [
      'Overall production is running as per normal',
    ],
  },
  fault: {
    text: [
      'AGV MiR200 encountered a problem while delivering material [ErrCode: 4729].',
      'Your production will be affected if this issue is not fixed',
      'Do you want me to fix the issue?',
    ],
    choices: true,
  },
  action: {
    text: [
      'Maintenance Work Order created: ',
      'Rescheduling production Work Order to meet on-time delivery',
      'Contacting the maintenance personnel',
    ],
  },
  maintenanceInProgess: {
    text: [
      'Maintenance engineer is attending the issue',
    ],
  },
  maintenanceDone: {
    text: [
      'Maintenance Work Order XXXXXXX ID: is completed.',
      'The production is resumed back to normal.',
    ],
  },
};
