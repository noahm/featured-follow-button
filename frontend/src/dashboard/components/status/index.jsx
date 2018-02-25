import style from './style';
import { Component } from 'preact';
import { getUsername } from '../../../utils';

export class Status extends Component {
  render({ channelName, displayName, isErrored }) {
    let statusLine = <span>Follow button is not active</span>;
    if (channelName) {
      statusLine = <span>Follow button is visible for {getUsername(channelName, displayName)}</span>;
    }
    return (
      <div className={style.Status}>
        {statusLine}
        {!!isErrored && this.renderError()}
      </div>
    );
  }

  renderError() {
    return (
      <div className={style.error}>
        NotLikeThis<br/>
        We couldn't update the button. Check your network connection and try again in a bit?
      </div>
    );
  }
}
