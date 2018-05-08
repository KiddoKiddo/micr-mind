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
      'Create maintenance WO. WO ID: XXXXXXX',
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
      'Maintenance W.O ID: XXXXXXX is completed and the issue is solved.',
      'The production resumed back to normal.',
    ],
  },
};
