module.exports = {
  init: {
    text: ['Initialize...'],
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
      'Create maintenance WO: ',
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
      'Maintenance W.O ID: is completed.',
      'The production resumed back to normal.',
    ],
  },
};
