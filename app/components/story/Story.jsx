import React from 'react';
import PropTypes from 'prop-types';
import io from '../../socket-api';
import Blink from './blink/Blink';

require('./Story.css');

const shortid = require('shortid');

const socket = io();

class Story extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      fault: false,
      sound: false,
    };

    this.addMessage = this.addMessage.bind(this);
    this.renderChoices = this.renderChoices.bind(this);
    this.selectChoice = this.selectChoice.bind(this);
  }

  componentDidMount() {
    // Let's manually start from controller
    socket.emit('start');

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
  }

  addMessage(text, choices) {
    const id = shortid.generate();
    this.setState({
      messages: [...this.state.messages, { text, choices, id }],
    });
  }

  selectChoice(id, choice) {
    const messages = [...this.state.messages];
    messages[id].selected = choice;
    this.setState({ messages });

    socket.emit(choice); // Reply to server
  }
  renderChoices(msg, id, last) {
    if (!last) {
      return msg.selected ? <span className="story-msg-selected">{msg.selected}</span> : '';
    }
    if (!msg.choices) return '';
    if (typeof msg.choices === 'object') {
      return (<div className="story-msg-choices">
        { msg.choices.map(choice =>
          <button
            key={choice}
            onClick={() => { this.selectChoice(id, choice); }}
          > {choice}</button>)}
      </div>);
    }
    return (<div className="story-msg-choices">
      <button className="ok" onClick={() => { this.selectChoice(id, 'OK'); }}>OK</button>
      <button className="cancel" onClick={() => { this.selectChoice(id, 'Cancel'); }}>Cancel</button>
    </div>);
  }

  render() {
    const msg = this.state.messages[this.state.messages.length - 1];
    const index = this.state.messages.length - 1;
    return (
      <div className="story-container">
        <div className="story-msg-container">
          { msg &&
          <div key={msg.id} className="story-msg">
            <div className="story-msg-text" dangerouslySetInnerHTML={{ __html: msg.text }} />
            {this.renderChoices(msg, index, index === this.state.messages.length - 1)}
          </div>}
        </div>
        <div className="story-blink-container">
          <Blink error={this.state.fault} sound={this.state.sound} />
        </div>
      </div>);
  }
}
export default Story;
