const content = require('./random-messages-content');

const RM_MIN_RATE = +process.env.RM_MIN_RATE || 5000;
const RM_MAX_RATE = +process.env.RM_MAX_RATE || 15000;

module.exports = {
  random: (min, max) => Math.round(Math.random() * (max - min)) + min,

  status: 0, // 0: running, 1: pause, 2: stop
  scheduleRandomMessages: (socket) => {
    setTimeout(() => {
      if (module.exports.status === 0) {
        socket.emit('random-message', module.exports.getOrderedMessage());
        module.exports.scheduleRandomMessages(socket);
      } else if (module.exports.status === 1) {
        module.exports.scheduleRandomMessages(socket);
      } else if (module.exports.status === 2) {
        // Do nothing
      }
    }, module.exports.random(RM_MIN_RATE, RM_MAX_RATE));

    return {
      resume: () => { module.exports.status = 0; },
      pause: () => { module.exports.status = 1; },
      stop: () => { module.exports.status = 2; },
      sendSpecialMessage: (key) => {
        socket.emit('random-message', module.exports.getSpecialMessage(key));
      },
    };
  },

  getRandomMessage: () =>
    content.message[module.exports.random(0, content.message.length - 1)],
  getSpecialMessage: key => content.special[key],

  ordered: -1,
  getOrderedMessage: () => {
    module.exports.ordered = (module.exports.ordered + 1) % content.message.length;
    return content.message[module.exports.ordered];
  },
};
