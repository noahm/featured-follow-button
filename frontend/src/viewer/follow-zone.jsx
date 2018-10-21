import { Component } from 'react';
import styles from './follow-zone.css';

export class FollowZone extends Component {
  render() {
    const {
      item,
      onClick,
    } = this.props;

    const style = {
      top: item.top + '%',
      left: item.left + '%',
      height: item.height + '%',
      width: item.width + '%',
    };

    return (
      <div className={styles.followZone} style={style} onClick={onClick}>
        <span>Click to follow {item.displayName || item.channelName}</span>
      </div>
    );
  }
}