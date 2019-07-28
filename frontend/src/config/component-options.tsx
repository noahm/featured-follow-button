import { Component, ChangeEvent } from "react";
import { Config } from "../config";

export class ComponentOptions extends Component {
  state = {
    hAlign: null,
    vAlign: null
  };

  config: Config;

  constructor(props: {}) {
    super(props);
    this.config = new Config();
    this.config.configAvailable.then(() => {
      this.setState({
        hAlign: this.config.liveState.componentAlignment,
        vAlign: this.config.liveState.componentVAlignment
      });
    });
  }

  render() {
    if (this.state.hAlign === null) {
      return null;
    }

    return (
      <>
        <p>
          <label>
            Horizontal Alignment&nbsp;
            <select
              value={(this.state.hAlign || 0).toString()}
              onChange={this.handleHAlignChange}
            >
              <option value={0}>Auto</option>
              <option value={1}>Left</option>
              <option value={2}>Right</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            Vertical Alignment&nbsp;
            <select
              value={(this.state.vAlign || 0).toString()}
              onChange={this.handleVAlignChange}
            >
              <option value={0}>Auto</option>
              <option value={1}>Top</option>
              <option value={2}>Bottom</option>
            </select>
          </label>
        </p>
      </>
    );
  }

  handleHAlignChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = +e.currentTarget.value;
    this.setState({
      hAlign: newValue
    });
    this.config.saveHAlignment(newValue);
  };

  handleVAlignChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = +e.currentTarget.value;
    this.setState({
      vAlign: newValue
    });
    this.config.saveVAlignment(newValue);
  };
}
