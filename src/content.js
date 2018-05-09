module.exports = {
  init: {
    text: [],
  },
  idle: {
    text: [
      'Normal operation.',
    ],
  },
  task: {
    text: [
      'AGV is in action...',
    ],
  },
  fault: {
    text: [
      'AGV encountered a problem.',
      'Do you want to tackle the issue?',
    ],
    choices: true,
  },
  action: {
    text: [
      'Reschedule production WO to delivery on time',
      'Contact the maintenance personnel via email.',
    ],
  },
  maintenanceInProgess: {
    text: [
      'Maintenance personnel is attending the issue',
    ],
  },
  maintenanceDone: {
    text: [
      'The production resumed back to normal.',
    ],
  },
};
