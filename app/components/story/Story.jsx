import React from 'react';
import PropTypes from 'prop-types';
import io from '../../socket-api';
import Blink from './blink/Blink';
import RandomMessage from './RandomMessage';

require('./Story.css');
const classNames = require('classnames');

const shortid = require('shortid');

const socket = io();

class Story extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: {},
      randomMessages: [],
      fault: false,
      sound: false,
      btn: false,
    };

    this.addMessage = this.addMessage.bind(this);
    this.renderChoices = this.renderChoices.bind(this);
    this.selectChoice = this.selectChoice.bind(this);
    this.addRandomMessage = this.addRandomMessage.bind(this);
  }

  componentDidMount() {
    // To reload the page from controller
    socket.on('reload', () => location.reload());

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

    // Receive random messages
    socket.on('random-message', msg => this.addRandomMessage(msg));

    // Receive the fault from "control"
    socket.on('fault', fault => this.setState({ fault }));
    socket.on('sound', sound => this.setState({ sound }));
    socket.on('btn', btn => this.setState({ btn }));
  }

  addMessage(text, choices) {
    const id = shortid.generate();
    this.setState({
      message: { text, choices, id },
    });
  }

  // Send choices to socket
  selectChoice(choice) { socket.emit(choice); }

  addRandomMessage(msg) {
    const randomMessages = this.state.randomMessages.slice();
    if (randomMessages.length > 20) {
      randomMessages.pop();
    }
    randomMessages.unshift(Object.assign({ id: shortid.generate() }, msg));
    this.setState({ randomMessages });
  }

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
          <div className="story-blink-container" onClick={() => socket.emit('start')}>
            <Blink error={this.state.fault} sound={this.state.sound} />
          </div>
        </div>
        <div className={this.state.btn ? 'story-menu-container' : 'story-menu-container hidden'} >
          <button onClick={() => socket.emit('open_app', { label: 'AGV Controller', position: 5 })}>
            Control Panel
          </button>
          <button onClick={() => socket.emit('open_app', { label: 'QUUPPA', position: 7 })}>
            Traceability
          </button>
          <button onClick={() => socket.emit('open_app', { label: 'MIR', position: 6 })}>
            Smart System
          </button>
          <button onClick={() => socket.emit('open_app', { label: 'PlantSim', position: 8 })}>
            Simulation
          </button>
        </div>
        <div className="story-random-message">
          <RandomMessage messages={this.state.randomMessages} />
        </div>
      </div>);
  }
}
export default Story;
