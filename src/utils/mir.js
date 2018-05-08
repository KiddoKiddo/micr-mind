const axios = require('axios');

const url = process.env.MIR_URL || 'http://10.100.108.210:8080/v1.0.0/';

const mir = {
  isInAction: () => axios.get(`${url}/status`)
  .then(response => response.data.state_id === 5) // "InTransit" (5)
  .catch(error => console.log(error)),

  getLatestMissionQueue: () => axios.get(`${url}/mission_queue`)
  .then(response => response.data[0])
  .catch(error => console.log(error)),

  getMissionQueueDetails: id => axios.get(`${url}/mission_queue/${id}`)
  .then(response => response.data)
  .catch(error => console.log(error)),

  isInStagingError: async () => {
    const latest = await module.exports.getLatestMissionQueue();
    if (latest.state !== 'Executing') {
      return false;
    }
    const mq = await module.exports.getMissionQueueDetails(latest.id);

    return mq.mission_id === (process.env.MIR_ERROR_DEMO || '4e11b245-4c43-11e8-97b9-f44d306f3f85');
  },
};

module.exports = mir;
