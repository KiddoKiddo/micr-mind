#!/usr/bin/env node

const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');

const test = async () => {
  let count = 0;
  const intervalObject = setInterval(async () => {
    count++;
    const result = await nc.placeApp('artc', count);
    if (count === 12) {
      count = 0;
    }
  }, 1000);
};
test();
