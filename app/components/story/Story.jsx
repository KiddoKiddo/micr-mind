import React from 'react';
import PropTypes from 'prop-types';

import io from '../../socket-api';

import Blink from './blink/Blink';

require('./Story.css');
const shortid = require('shortid');

class Story extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [
        { text: 'This is text', id: shortid.generate() },
        { text: 'Some text happened.', id: shortid.generate() },
        { text: 'Some more very very very very very very very very very very very very long text.', id: shortid.generate() },
        { text: 'Text again.', choices: true, id: shortid.generate() },
      ],
      fault: false,
    };

    this.addMessage = this.addMessage.bind(this);
    this.renderChoices = this.renderChoices.bind(this);
    this.selectChoice = this.selectChoice.bind(this);
  }

  componentDidMount() {
    // Receive message from "control"
    io.on('message', (msg) => {
      let text;
      let choices;
      try {
        const msg_obj = JSON.parse(msg);
        text = msg_obj.text;
        choices = msg_obj.choices;
      } catch (e) {
        text = msg;
      }
      this.addMessage(text, choices);
    });

    // Receive the fault from "control"
    io.on('fault', msg => this.setState({ fault: true }));
  }

  addMessage(text, choices) {
    const id = shortid.generate();
    this.setState({
      messages: [...this.state.messages, { text, choices, id }],
    });
    this.setState({ fault: true });
  }

  selectChoice(id, choice) {
    const messages = [...this.state.messages];
    messages[id].selected = choice;
    this.setState({ messages });

    // Test
    this.addMessage('More text', ['Choice 1', 'Choice 2']);
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
    return (
      <div className="story-container">
        <div className="story-msg-container">
          {this.state.messages.map((msg, i) => (
            <div key={msg.id} className="story-msg">
              {msg.text}
              {this.renderChoices(msg, i, i === this.state.messages.length - 1)}
            </div>
          ))}
        </div>
        <div className="story-blink-container">
          <Blink error={this.state.fault} />
        </div>
      </div>);
  }
}
export default Story;
