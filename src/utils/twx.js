const axios = require('axios');

const twx_url = 'http://192.168.128.51:8080/Thingworx/Things';
const twx_headers = {
  Authorization: 'Basic bWljcjptaWNy',
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const isLineRunning = async () => {
  const response = await axios({
    method: 'post',
    url: `${twx_url}/MSChatBot_API/Services/IsLineRunning`,
    headers: twx_headers,
  }).catch((e) => {
    console.error(e);
  });
  return response.data.rows[0].result;
};
module.exports = { isLineRunning };
