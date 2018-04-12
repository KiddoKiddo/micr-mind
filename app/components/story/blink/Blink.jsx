import React from 'react';
import PropTypes from 'prop-types';

require('./Blink.css');

const Blink = ({ error }) => (
  <div>
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
      <filter id="blurMe">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
      <circle className="pulse-disk" cx="200" cy="200" filter="url(#blurMe)" />
      <circle className="pulse-circle" cx="200" cy="200" filter="url(#blurMe)" />
    </svg>)
  }
  </div>
  );

Blink.propTypes = {
  error: React.PropTypes.bool.isRequired,
};

export default Blink;
