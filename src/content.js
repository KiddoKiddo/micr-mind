module.exports = {
  init: {
    text: [],
  },
  idle: {
    text: [
      'The Production Line is running at the optimal level currently.',
    ],
  },
  fault: {
    text: [
      'Conveyor belt at station #1 is not working!',
      'Do you want to take action?',
    ],
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
      'Conveyor bell is stopped',
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
