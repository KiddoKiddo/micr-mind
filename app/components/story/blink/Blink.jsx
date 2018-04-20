import React from 'react';
import PropTypes from 'prop-types';

const Sound = require('react-sound').default;

require('./Blink.css');

const Blink = ({ error, sound }) => (
  <div className="pulse-container">
    {sound ? <Sound
      url="/sound/shortsirene.mp3"
      playStatus="PLAYING"
      loop
    /> : ''}
    {error ?
    (<svg
      className="pulse error" x="0px" y="0px"
      width="400px" height="400px" viewBox="0 0 400 400"
    >
      <circle className="pulse-disk" cx="200" cy="200" />
      <circle className="pulse-circle" cx="200" cy="200" />
      <circle className="pulse-circle-2" cx="200" cy="200" />
    </svg>)
    :
    (<svg
      className="pulse ok" x="0px" y="0px"
      width="400px" height="400px" viewBox="0 0 400 400"
    >
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
      <circle className="pulse-disk" cx="200" cy="200" />
      <circle className="pulse-circle" cx="200" cy="200" filter="url(#blur)" />
    </svg>)
  }
  </div>
  );

Blink.propTypes = {
  error: React.PropTypes.bool.isRequired,
  sound: React.PropTypes.bool,
};
Blink.defaultProps = {
  sound: false,
};

export default Blink;
