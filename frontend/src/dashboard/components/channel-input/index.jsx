import styles from './style';
import { Component } from 'react';

const LOGIN_REGEX = /^[a-zA-Z0-9]\w{0,23}$/;
const remoteCheckCache = {};

export class ChannelInput extends Component {
  state = {
    pendingChannelName: '',
    isValidating: false,
    useRemoteDisplayName: true,
  };
  pendingDisplayName = '';
  channelInput = null;

  componentWillUpdate(nextProps, nextState) {
    if (!this.isValid(nextState.pendingChannelName)) {
      this.channelInput.setCustomValidity('No spaces or special characters');
    } else if (this.isKnownBad(nextState.pendingChannelName)) {
      this.channelInput.setCustomValidity('Not a twitch channel');
    } else {
      this.channelInput.setCustomValidity('');
    }
  }

  render(props, { isValidating, pendingChannelName, useRemoteDisplayName }) {
    return (
      <form disabled={isValidating} onSubmit={this.onSubmit}>
        <input
          width="15"
          placeholder="Channel Login"
          ref={this.saveInputRef}
          value={pendingChannelName}
          onKeyUp={this.setChannelName}
        />
        <span className={styles.error}> {this.renderError()}</span>
        <br />
        <input
          width="15"
          placeholder="Display Name (optional)"
          value={this.pendingDisplayName}
          onChange={this.setDisplayName}
          disabled={useRemoteDisplayName}
        />
        <label>
          <input type="checkbox" checked={this.state.useRemoteDisplayName} onChange={this.setRemoteDisplayName} />
          {' Auto'}
        </label>
        <br />
        <button disabled={isValidating} onClick={this.onClickAdd}>Queue</button>
        <button disabled={isValidating} onClick={this.onClickActivate}>Display</button>
      </form>
    );
  }

  saveInputRef = (element) => {
    this.channelInput = element;
  }

  renderError() {
    if (this.isKnownBad()) {
      return 'Not a Twitch channel';
    }
    if (this.state.pendingChannelName && !this.isValid()) {
      return 'e.g. "lirik"';
    }
  }

  setChannelName = (e) => {
    let channelName = e.currentTarget.value.toLowerCase();
    e.currentTarget.value = channelName;
    channelName = channelName.trim();
    if (channelName === this.state.pendingChannelName) {
      return;
    }
    this.setState({
      pendingChannelName: channelName,
    });
  }

  setDisplayName = (e) => {
    this.pendingDisplayName = e.currentTarget.value;
  }

  setRemoteDisplayName = (e) => {
    this.pendingDisplayName = '';
    this.setState({
      useRemoteDisplayName: e.currentTarget.checked,
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
  }

  onClickAdd = () => {
    this.checkValidRemote().then((isValid) => {
      if (!isValid) {
        return;
      }
      this.props.onAdd(this.state.pendingChannelName, this.pendingDisplayName);
      this.pendingDisplayName = '';
      this.setState({
        pendingChannelName: '',
      });
    });
  }

  onClickActivate = () => {
    this.checkValidRemote().then((isValid) => {
      if (!isValid) {
        return;
      }
      this.props.onActivate(this.state.pendingChannelName, this.pendingDisplayName);
      this.pendingDisplayName = '';
      this.setState({
        pendingChannelName: '',
      });
    });
  }

  isValid(channelName = this.state.pendingChannelName) {
    return !channelName || LOGIN_REGEX.test(channelName);
  }

  isKnownBad(channelName = this.state.pendingChannelName) {
    if (channelName && typeof remoteCheckCache[channelName] === 'boolean') {
      return !remoteCheckCache[channelName];
    }
    return false;
  }

  checkValidRemote() {
    if (this.state.isValidating) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      if (!this.isValid()) {
        resolve(false);
        return;
      }
      const channelName = this.state.pendingChannelName;
      if (!this.state.useRemoteDisplayName && typeof remoteCheckCache[channelName] === 'boolean') {
        resolve(remoteCheckCache[channelName]);
        return;
      }

      this.setState({
        isValidating: true,
      });
      const remoteCheck = fetch('https://api.twitch.tv/helix/users?login='+channelName, {
        headers: {
          'Client-ID': this.props.clientID,
        },
      })
      .then(r => r.json())
      .then((response) => {
        // fill in display name if left blank?
        if (response.data && response.data.length) {
          if (this.state.useRemoteDisplayName) {
            this.pendingDisplayName = response.data[0].display_name;
          }
          return true;
        }
        return false;
      })
      .catch(() => {
        // maybe throws here should be treated differently...?
        return false;
      });
      remoteCheck.then((result) => {
        remoteCheckCache[channelName] = result;
        this.setState({
          isValidating: false,
        });
        resolve(result);
      });
    });
  }
}
