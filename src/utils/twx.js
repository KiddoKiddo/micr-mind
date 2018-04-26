const axios = require('axios');

const url = process.env.TWX_URL || 'http://192.168.128.51:8080/Thingworx/Things';
const defaultHeaders = {
  Authorization: `Basic ${process.env.TWX_APPKEY || 'bWljcjptaWNy'}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// TODO: Proper error logging
const twx = {
  getThing: thing => axios({
    method: 'post',
    url: `${url}/MSChatBot_API/${thing}/`,
    headers: defaultHeaders,
  })
  .then(response => response.data.rows[0].result)
  .catch(error => console.log(error.response.data)),

  isLineRunning: () => axios({
    method: 'post',
    url: `${url}/MSChatBot_API/Services/IsLineRunning`,
    headers: defaultHeaders,
  })
  .then(response => response.data.rows[0].result)
  .catch(error => console.log(error.response.data)),
};

module.exports = twx;
