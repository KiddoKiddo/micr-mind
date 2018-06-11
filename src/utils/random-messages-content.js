module.exports = {
  // 0: normal (green), 1: warning (yellow), 2: error (red)
  message: [
    { type: 0, text: 'Delivery part from pos A to B' },
    { type: 1, text: 'Energy monitoring on shot-peening machine.' },
    { type: 2, text: 'Station 2 worker was out from the station for more 7 minutes.' },
    { type: 0, text: 'So random #0' },
    { type: 1, text: 'So random #1' },
    { type: 2, text: 'So random #2' },
  ],
  special: {
    'agv-fault': { type: 2, text: 'The AGV is stuck' },
    'agv-ok': { type: 0, text: 'The AGV is fixed and back to normal operations.' },
  },
};
