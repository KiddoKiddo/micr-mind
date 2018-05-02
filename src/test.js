#!/usr/bin/env node

const twx = require('./utils/twx');
const nc = require('./utils/nervecenter');
const mir = require('./utils/mir');

const test = async () => {
  const intervalObject = setInterval(async () => {
    console.log('isInAction', await mir.isInAction());
    console.log('isInStagingError', await mir.isInStagingError());
  }, 5000);
};
test();
