import React from 'react';
import PropTypes from 'prop-types';
import io from '../../socket-api';
import Blink from './blink/Blink';

require('./Story.css');
const classNames = require('classnames');

const shortid = require('shortid');

const socket = io();

class Story extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: {},
      fault: false,
      sound: false,
      blinkPos: 'right',
      flowState: 'init',
    };

    this.addMessage = this.addMessage.bind(this);
    this.renderChoices = this.renderChoices.bind(this);
    this.selectChoice = this.selectChoice.bind(this);
  }

  componentDidMount() {
    // Let's manually start from controller
    socket.emit('start'); // To 'idle'

    // Receive message from "control"
    socket.on('message', (data) => {
      if (typeof data === 'string') {
        this.addMessage(data);
      } else {
        const text = data.text || '';
        const choices = data.choices || null;
        this.addMessage(text, choices);
      }
    });

    // Receive the fault from "control"
    socket.on('fault', fault => this.setState({ fault }));
    socket.on('sound', sound => this.setState({ sound }));
    socket.on('state', flowState => this.stState({ flowState }));
  }

  addMessage(text, choices) {
    const id = shortid.generate();
    this.setState({
      message: { text, choices, id },
    });
  }

  // Send choices to socket
  selectChoice(choice) { socket.emit(choice); }

  // Render choices (if any)
  renderChoices(msg) {
    // No choice
    if (!msg.choices) return '';
    // Custom choices
    if (typeof msg.choices === 'object') {
      return (<div className="story-msg-choices">
        { msg.choices.map(choice =>
          <button
            key={choice}
            onClick={() => { this.selectChoice(choice); }}
          > {choice}</button>)}
      </div>);
    }
    // Ok cancel choices
    return (<div className="story-msg-choices">
      <button className="ok" onClick={() => { this.selectChoice('OK'); }}>OK</button>
      <button className="cancel" onClick={() => { this.selectChoice('Cancel'); }}>Cancel</button>
    </div>);
  }

  render() {
    const msg = this.state.message;
    const blinkClasses = classNames({
      'story-blink-container': true,
      'story-blink-container-left': this.state.blinkPos === 'left',
      'story-blink-container-right': this.state.blinkPos === 'right',
    });
    return (
      <div className="story-container">
        <div className="story-msg-container">
          { msg &&
          <div key={msg.id} className="story-msg">
            <div className="story-msg-text">
              {msg.text && msg.text.map((item, key) =>
                <span key={shortid.generate()}>{item}<br /></span>)}
            </div>
            {this.renderChoices(msg)}
          </div> }
        </div>
        <div className="story-menu-container">
          <button onClick={() => socket.emit('open_app', { label: 'AGV Controller', position: 5 })}>
            AGV Controller
          </button>
          <button onClick={() => socket.emit('open_app', { label: 'QUUPPA', position: 5 })}>
            Quuppa
          </button>
          <button onClick={() => socket.emit('open_app', { label: 'CAM', position: 5 })}>
            IP CAM
          </button>
        </div>
        <div className={blinkClasses}>
          <Blink error={this.state.fault} sound={this.state.sound} />
        </div>
      </div>);
  }
}
export default Story;
