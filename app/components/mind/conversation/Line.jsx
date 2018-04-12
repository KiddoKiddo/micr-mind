import React from "react";
import { Motion, spring } from "react-motion";

require("./Line.css");

class Line extends React.Component {
  render() {
    const config = { stiffness: 140, damping: 10 };
    const toCSS = scale => ({
      transform: `scale(${scale})`
    });

    return this.props.isNew ? (
      <Motion defaultStyle={{ scale: 0 }} style={{ scale: spring(1, config) }}>
        {value => (
          <div className="line line_latest" style={toCSS(value.scale)}>
            <div>{this.props.text}</div>
            <div>
              {this.props.choices && this.props.choices.map((choice, i) => (
                <button
                  key={i}
                  className="line-button"
                  onClick={() => {
                    this.props.selectChoice(this.props.lineId, choice);
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}
      </Motion>
    ) : (
      <div className="line">
        <div>{this.props.text}</div>
        <div>
          {this.props.choices &&
            this.props.choices.map((choice, i) => (
              <span
                key={i}
                className={
                  choice === this.props.selected
                    ? "selected-choice choice"
                    : "choice"
                }
              >
                {choice}
              </span>
            ))}
        </div>
      </div>
    );
  }
}

export default Line;
