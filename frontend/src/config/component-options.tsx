import { Component, ChangeEvent, Fragment } from "react";
import { Config } from "../config";

export class ComponentOptions extends Component {
  state = {
    header: ""
  };
  saveTimer = 0;

  config: Config;

  constructor(props: {}) {
    super(props);
    this.config = new Config();
    this.config.configAvailable.then(() => {
      this.setState({
        header: this.config.liveState.componentHeader
      });
    });
  }

  render() {
    if (this.state.header === null) {
      return null;
    }

    return (
      <Fragment>
        <p>
          Used as a component, this extension will display a list of channels a
          viewer can click to follow. You may set a message to display above the
          list of buttons here:
        </p>
        <p>
          <label>
            Header&nbsp;
            <input
              value={this.state.header}
              onChange={this.handleHeaderChange}
            />
          </label>
        </p>
      </Fragment>
    );
  }

  handleHeaderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    this.setState({
      header: newValue
    });
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(
      (() => this.config.saveComponentHeader(newValue)) as TimerHandler,
      1000
    );
  };
}
