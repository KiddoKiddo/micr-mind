const axios = require('axios');

const url = process.env.MIR_URL || 'http://10.100.108.210:8080/v1.0.0/';

const mir = {
  isInAction: () => axios.get(`${url}/status`)
  .then(response => response.data.state_id === 5) // "InTransit" (5)
  .catch(error => console.log(error)),

  getAllMissionQueues: () => axios.get(`${url}/mission_queue`)
  .then(response => response.data)
  .catch(error => console.log(error)),

  getMissionQueueDetails: id => axios.get(`${url}/mission_queue/${id}`)
  .then(response => response.data)
  .catch(error => console.log(error)),

  deleteMissionQueue: id => axios.delete(`${url}/mission_queue/${id}`)
  .then(response => console.log(response.data))
  .catch(error => console.log(error)),

  isInDemoError: async () => {
    const mission_queues = await module.exports.getAllMissionQueues();
    const latest = mission_queues.find(m => m.state === 'Executing');
    if (!latest) return false;
    const mq = await module.exports.getMissionQueueDetails(latest.id);
    return mq.mission_id === (process.env.MIR_ERROR_DEMO || '590f1604-5504-11e8-8d66-f44d306f3f85');
  },

  deleteLatestExecuting: async () => {
    const mission_queues = await module.exports.getAllMissionQueues();
    const latest = mission_queues.find(m => m.state === 'Executing');
    if (!latest) return false;
    module.exports.deleteMissionQueue(latest.id);
    return true;
  },
};

module.exports = mir;
