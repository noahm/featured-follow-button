import classNames from 'classnames';
import { Component } from 'react';
import styles from './follow-zone.css';

export class FollowZone extends Component {
  render() {
    const {
      item,
      onClick,
      showBorder,
    } = this.props;

    const style = {
      top: item.top + '%',
      left: item.left + '%',
      height: item.height + '%',
      width: item.width + '%',
    };

    return (
      <div className={classNames(styles.followZone, { [styles.showBorder]: showBorder })} style={style} onClick={onClick}>
        <span className={styles.text}>Click to follow {item.displayName || item.channelName}</span>
      </div>
    );
  }
}