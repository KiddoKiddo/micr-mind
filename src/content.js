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
      'AGV encounters a problem.',
      'Do you want to tackle the issue?',
    ],
    choices: true,
  },
  action: {
    text: [
      'Create maintenance WO',
      'Reschedule production WO to delivery on time',
      'Contact the maintenance personnel via email.',
    ],
  },
  maintenanceInProgess: {
    text: [
      'Maintenance personnel is attending the issue',
      'Maintenance WO ID: XXXXXXX',
    ],
  },
  maintenanceDone: {
    text: [
      'Maintenance W.O ID: XXXXXXX is completed and the issue is solved.',
      'The production resumed back to normal.',
      'The on-time delivery schedule is not affected.',
    ],
  },
};
