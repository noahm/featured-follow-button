import { Component } from 'preact';

const LOGIN_REGEX = /^[a-z0-9]\w{0,23}$/;

export class ChannelInput extends Component {
  state = {
    pendingChannelName: '',
    pendingDisplayName: '',
  };

  render(props, { pendingChannelName, pendingDisplayName }) {
    return (
      <form onSubmit={this.onSubmit}>
        <input
          width="15"
          placeholder="Channel Login"
          value={pendingChannelName}
          onChange={this.setChannelName}
          pattern="[a-zA-Z0-9]\w{0,23}"
        />
        {this.state.pendingChannelName && !this.isValid() && ' No spaces: "lirik"'}
        <br />
        <input width="15" placeholder="Display Name (optional)" value={pendingDisplayName} onChange={this.setDisplayName} />
        <br />
        <button onClick={this.onClickAdd}>Queue</button>
        <button onClick={this.onClickActivate}>Activate</button>
      </form>
    );
  }

  setChannelName = (e) => {
    this.setState({ pendingChannelName: e.currentTarget.value.toLowerCase() });
  }

  setDisplayName = (e) => {
    this.setState({ pendingDisplayName: e.currentTarget.value });
  }

  onSubmit = (e) => {
    e.preventDefault();
  }

  onClickAdd = () => {
    if (!this.isValid()) {
      return;
    }
    this.props.onAdd(this.state.pendingChannelName, this.state.pendingDisplayName);
    this.setState({
      pendingChannelName: '',
      pendingDisplayName: '',
    });
  }

  onClickActivate = () => {
    if (!this.isValid()) {
      return;
    }
    this.props.onActivate(this.state.pendingChannelName, this.state.pendingDisplayName);
    this.setState({
      pendingChannelName: '',
      pendingDisplayName: '',
    });
  }

  isValid() {
    return LOGIN_REGEX.test(this.state.pendingChannelName);
  }
}
