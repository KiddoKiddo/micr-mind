#!/usr/bin/env node

require('dotenv').config();

const twx = require('../utils/twx');
const nc = require('../utils/nervecenter');
const mir = require('../utils/mir');

// TODO: Not done yet
const apps = nc.getApps();
// console.log(apps);
