#!/usr/bin/env node

const twx = require('../utils/twx');
const nc = require('../utils/nervecenter');
const mir = require('../utils/mir');

const test = async () => {
  const intervalObject = setInterval(async () => {
    const isInAction = await mir.isInAction();
    const isInDemoError = await mir.isInDemoError();

    console.log('isInAction', isInAction);
    console.log('isInDemoError', isInDemoError);
    if (isInDemoError) {
      console.log('Going to delete Error_Demo');
      setTimeout(() => {
        mir.deleteLatestExecuting();

        clearInterval(intervalObject);
      }, 10000);
    }
  }, 5000);
};
test();
