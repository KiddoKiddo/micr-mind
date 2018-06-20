module.exports = {
  // 0: normal (green), 1: warning (yellow), 2: error (red)
  message: [
    { type: 0, text: 'Deliverying parts from warehouse to lean line.' },
    { type: 0, text: 'Energy is monitored on shot-peening machine.' },
    { type: 1, text: 'Station 2 worker was out from the station for more 7 minutes.' },
    { type: 1, text: 'Spindle unbalance detected in NTX1000. Responsible parties are notified.' },
    { type: 1, text: 'Maintenance overdue for Shot Peening machine. Contacting Maintenance department.' },
    { type: 1, text: 'Cycle time for station 3 exceeded by 1 minute. Production is not affected.' },
    { type: 0, text: 'Raw Material just arrived for the POD/17/8-5 for SMSR-20 Gearbox. MiR200 is collecting now.' },
    { type: 0, text: 'PO TUV requires extra material handlers to pack the shipment.' },
    { type: 0, text: 'Scheduled downtime on ABC machine just ended. Machine is returned into production.' },
  ],
  special: {
    'agv-fault': { type: 2, text: 'The AGV encountered errors.' },
    'agv-ok': { type: 0, text: 'The AGV is fixed and back to normal operations.' },
  },
};
