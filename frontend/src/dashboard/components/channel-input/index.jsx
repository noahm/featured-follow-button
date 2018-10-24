import styles from './style';
import { Component } from 'react';

const LOGIN_REGEX = /^[a-zA-Z0-9]\w{0,23}$/;
const remoteCheckCache = {};

export class ChannelInput extends Component {
  state = {
    pendingChannelName: '',
    pendingDisplayName: '',
    isValidating: false,
    useRemoteDisplayName: true,
  };
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

  render() {
    const { isValidating, pendingChannelName, useRemoteDisplayName } = this.state;
    return (
      <form disabled={isValidating} onSubmit={this.onSubmit}>
        <input
          width="15"
          placeholder="Channel Login"
          ref={this.saveInputRef}
          value={pendingChannelName}
          onChange={this.setChannelName}
        />
        <span className={styles.error}> {this.renderError()}</span>
        <br />
        <input
          width="15"
          placeholder="Display Name (optional)"
          value={this.state.pendingDisplayName}
          onChange={this.setDisplayName}
          disabled={useRemoteDisplayName}
        />
        <label>
          <input type="checkbox" checked={this.state.useRemoteDisplayName} onChange={this.setRemoteDisplayName} />
          {' Auto'}
        </label>
        <br />
        <button disabled={isValidating} onClick={this.onClickActivate}>Activate</button>
        <button disabled={isValidating} onClick={this.onClickFavorite}>Favorite</button>
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
    this.setState({
      pendingDisplayName: e.currentTarget.value,
    });
  }

  setRemoteDisplayName = (e) => {
    this.setState({
      pendingDisplayName: '',
      useRemoteDisplayName: e.currentTarget.checked,
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
  }

  onClickFavorite = () => {
    this.checkValidRemote().then((isValid) => {
      if (!isValid) {
        return;
      }
      this.props.onAddFavorite(this.state.pendingChannelName, this.state.pendingDisplayName);
      this.setState({
        pendingChannelName: '',
        pendingDisplayName: '',
      });
    });
  }

  onClickActivate = () => {
    this.checkValidRemote().then((isValid) => {
      if (!isValid) {
        return;
      }
      this.props.onActivate({
        channelName: this.state.pendingChannelName,
        displayName: this.state.pendingDisplayName,
      });
      this.setState({
        pendingChannelName: '',
        pendingDisplayName: '',
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
      if (!this.props.clientID) {
        resolve(true);
        return;
      }
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
            this.setState({
              pendingDisplayName: response.data[0].display_name,
            });
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
