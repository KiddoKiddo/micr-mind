import React from 'react';
import PropTypes from 'prop-types';

const Sound = require('react-sound').default;

require('./RandomMessage.css');

const classes = ['random-messsage rm-ok',
  'random-messsage rm-warning',
  'random-messsage rm-error'];
const RandomMessage = ({ messages }) => (
  <div className="random-message-container">
    {messages.map(msg => <div key={msg.id} className={classes[msg.type]}>{msg.text}</div>)}
    <div className="random-message-cover" />
  </div>
  );

RandomMessage.propTypes = {
  messages: React.PropTypes.array,
};
RandomMessage.defaultProps = {
  messages: [],
};

export default RandomMessage;
