import style from './style';
import { Component } from 'react';
import { getUsername } from '../../../utils';

export class Status extends Component {
  render() {
    const { channelName, displayName, onClear } = this.props;
    let statusLine = <span>Follow button is not active</span>;
    if (channelName) {
      statusLine = <span>Follow button is visible for {getUsername(channelName, displayName)}</span>;
    }
    return (
      <div className={style.Status}>
        {statusLine} {channelName && <button onClick={onClear}>Clear</button>}
      </div>
    );
  }
}
