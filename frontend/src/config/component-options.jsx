import { Component } from "react";
import { Config } from "../config";

export class ComponentOptions extends Component {
  state = {
    alignment: null
  };

  /** @type {Config} */
  config;

  constructor(props) {
    super(props);
    this.config = new Config();
    this.config.configAvailable.then(() => {
      this.setState({
        alignment: this.config.liveState.componentAlignment
      });
    });
  }

  render() {
    if (this.state.alignment === null) {
      return null;
    }

    return (
      <p>
        <label>
          Align button&nbsp;
          <select
            value={(this.state.alignment || 0).toString()}
            onChange={this.handleAlignChange}
          >
            <option value={0}>Auto</option>
            <option value={1}>Left</option>
            <option value={2}>Right</option>
          </select>
        </label>
      </p>
    );
  }

  handleAlignChange = e => {
    const newValue = +e.currentTarget.value;
    this.setState({
      alignment: newValue
    });
    this.config.saveAlignment(newValue);
  };
}
