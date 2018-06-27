module.exports = {
  // 0: normal (green), 1: warning (yellow), 2: error (red)
  message: [
    { type: 0, text: 'Transporter 097 is delivering parts from warehouse to assembly line.' },
    { type: 1, text: 'Station 2 worker was out from the station for more 7 minutes.' },
    { type: 1, text: 'Maintenance overdue for Shot Peening machine. Contacting Maintenance department.' },
    { type: 0, text: 'Raw Material just arrived for the POD/17/8-5 for SMSR-20 Gearbox. MiR200 is collecting now.' },
    { type: 1, text: 'Spindle unbalance detected in NTX1000. Responsible parties are notified.' },
    { type: 0, text: 'POD/20/5-9 requires extra material handlers to pack the shipment.' },
    { type: 1, text: 'Cycle time for station 3 exceeded by 1 minute. Production is not affected.' },
    { type: 0, text: 'Scheduled downtime on NTX1000 machine just ended. Machine is returned into production.' },
  ],
  special: {
    'agv-fault': { type: 2, text: 'AGV MiR200 encountered a problem while delivering material [ErrCode: 4729].' },
    'agv-ok': { type: 0, text: 'The AGV is fixed and back to normal operations.' },
  },
};
