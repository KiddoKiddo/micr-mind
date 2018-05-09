const axios = require('axios');

const appKey = process.env.NC_APIKEY || '30d8c5b07397';
const host = process.env.NC_HOST || '10.100.124.11';
const defaultHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${appKey}`,
};

const boxes = {
  1: { x: 0, y: 0, width: 960, height: 540 },
  2: { x: 0, y: 540, width: 960, height: 540 },
  3: { x: 960, y: 0, width: 960, height: 540 },
  4: { x: 960, y: 540, width: 960, height: 540 },
  5: { x: 1923, y: 0, width: 960, height: 540 },
  6: { x: 1923, y: 540, width: 960, height: 540 },
  7: { x: 2883, y: 0, width: 960, height: 540 },
  8: { x: 2883, y: 540, width: 960, height: 540 },
  9: { x: 3845, y: 0, width: 960, height: 540 },
  10: { x: 3845, y: 540, width: 960, height: 540 },
  11: { x: 4805, y: 0, width: 960, height: 540 },
  12: { x: 4805, y: 540, width: 960, height: 540 },
};

const nc = {
  getApps: () => axios.get(`http://${host}/api/v2/apps`,
    { headers: defaultHeaders })
    .then(response => response.data)
    .catch(error => console.log(`${error.response.status} - ${error.response.statusText}`)),

  createApp: async (opts) => {
    const options = Object.assign({
      ar: '16x9',
      label: 'Yahoo',
      reduce: false,
      url: 'http://www.yahoo.com',
      zoom: 100,
    }, opts);
    return axios.post(`http://${host}/api/v2/apps`, options, { headers: defaultHeaders })
    .catch(error => console.log(`${error.response.status} - ${error.response.statusText}`));
  },

  placeApp: async (keyword, position) => {
    if (!keyword || !position) {
      console.log('[ERR] No keyword or position provided.');
      return false;
    }

    console.log(`[nervecenter] Place app with label ${keyword} at ${position}`);

    const apps = await module.exports.getApps();
    const app = apps.find(item =>
      (item.label && item.label.includes(keyword)) || item.url.includes(keyword));

    if (!app) {
      console.log(`[nervecenter] No app with the label or url contains ${keyword}`);
      return false;
    }

    let windshieldId;
    if (app.windshieldIds.length === 0) {
      console.log(`[nervecenter] URL: ${app.url}`);
      windshieldId = await axios.post(`http://${host}/api/v2/items`,
        {
          uuid: `${app.uuid}.x.0.y.0`,
          screen: 'left',
          surface: 'main',
          box: boxes[position],
        }, { headers: defaultHeaders })
        .then(response => response.data)
        .catch(error => console.log(`${error.response.status} - ${error.response.statusText}`));
    } else {
      console.log(`[nervecenter] URL: ${app.url}`);
      windshieldId = app.windshieldIds[0].id; // Assume only one screen
      axios.patch(`http://${host}/api/v2/item/${windshieldId}`,
        {
          surface: 'main',
          screen: 'left',
          box: boxes[position],
        },
        { headers: defaultHeaders })
        .then(response => response.data)
        .catch(error => console.log(`${error.response.status} - ${error.response.statusText}`));
    }

    return true;
  },
};

module.exports = nc;
