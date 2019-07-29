import classNames from 'classnames';
import { Component, CSSProperties } from 'react';
import styles from './follow-button.css';
import { LiveLayoutItem } from '../models';

interface Props {
  item: LiveLayoutItem;
  componentMode: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onAnimationEnd?: () => void;
  animateOut?: boolean;
}

export class FollowButton extends Component<Props> {
  render() {
    const {
      item,
      componentMode,
      disabled,
      onAnimationEnd,
      animateOut,
    } = this.props;

    const style: CSSProperties = componentMode ? {
      position: 'static',
    } : {
      top: item.top + '%',
      left: item.left + '%',
    };

    return (
      <div onAnimationEnd={onAnimationEnd} className={classNames(styles.animation, styles.animationShow, { [styles.animationHide]: animateOut })} style={style}>
        <div className={styles.animationSlide}>
          <button disabled={disabled} className={classNames(styles.button, { [styles.componentMode]: componentMode })} onClick={this.handleClick}>
            <span className={styles.buttonText}>
              <svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px">
                <path clipRule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fillRule="evenodd" />
              </svg>
              {!componentMode && 'Follow '}{item.displayName || item.channelName}
            </span>
          </button>
        </div>
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
    if (!this.props.item.channelName) {
      return;
    }
    Twitch.ext!.actions.followChannel(this.props.item.channelName);
  }
}
