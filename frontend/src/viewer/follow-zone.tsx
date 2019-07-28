import classNames from 'classnames';
import { Component } from 'react';
import styles from './follow-zone.css';
import { LiveButton, PositionedZone } from '../models';

interface Props {
  item: LiveButton & PositionedZone;
  onClick: () => void;
  showBorder: boolean;
  disabled: boolean;
}

export class FollowZone extends Component<Props> {
  render() {
    const {
      item,
      disabled,
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
      <div className={classNames(styles.followZone, { [styles.showBorder]: showBorder })} style={style} onClick={!disabled ? onClick : undefined}>
        <span className={styles.text}>Click to follow {item.displayName || item.channelName}</span>
      </div>
    );
  }
}