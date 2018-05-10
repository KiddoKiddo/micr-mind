#!/usr/bin/env node

require('dotenv').config();

console.log(process.env);

const twx = require('../utils/twx');
const nc = require('../utils/nervecenter');
const mir = require('../utils/mir');

const test = async () => {
  // TODO: Not done yet
  const apps = await nc.getApps();
  console.log(apps);
};

test();
