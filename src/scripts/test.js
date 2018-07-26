#!/usr/bin/env node

const twx = require('../utils/twx');
const nc = require('../utils/nervecenter');
const mir = require('../utils/mir');

const test = async () => {
  // const intervalObject = setInterval(async () => {
  //   const isInAction = await mir.isInAction();
  //   const isInDemoError = await mir.isInDemoError();
  //
  //   console.log('isInAction', isInAction);
  //   console.log('isInDemoError', isInDemoError);
  //   if (isInDemoError) {
  //     console.log('Going to delete Error_Demo');
  //     setTimeout(() => {
  //       mir.deleteLatestExecuting();
  //
  //       clearInterval(intervalObject);
  //     }, 10000);
  //   }
  // }, 5000);

  // MICR-KPI Dashboards
  // NC_APIKEY=360469f0f39c node test.js
  // nc.placeApp('quickstats', 1);
  // nc.placeApp('oee', 2);
  // nc.placeApp('RejectList', 11);
  // nc.placeApp('machinestat', 4);
  // nc.placeApp('downtime', 9);
  // nc.placeApp('cost-management', 10);
  // nc.placeApp('maintenance', 3);
  // nc.placeApp('inventory', 12);

  // NC_APIKEY=2e08f2268edb node test.js
  nc.removeWindshield('AGV Controller');
};
test();
