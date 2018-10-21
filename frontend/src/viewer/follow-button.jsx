import classNames from 'classnames';
import { Component } from 'react';
import styles from './follow-button.css';

export class FollowButton extends Component {
  render() {
    const {
      channelName,
      displayName,
      componentMode,
      disabled,
      onClick,
      onAnimationEnd,
      animateOut,
    } = this.props;

    return (
      <div onAnimationEnd={onAnimationEnd} className={classNames(styles.animation, styles.animationShow, { [styles.animationHide]: animateOut })}>
        <div className={styles.animationSlide}>
          <button disabled={disabled} className={classNames(styles.button, { [styles.componentMode]: componentMode })} onClick={onClick}>
            <span className={styles.buttonText}>
              <svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px">
                <path clipRule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fillRule="evenodd" />
              </svg>
              Follow {displayName || channelName}
            </span>
          </button>
        </div>
      </div>
    );
  }
}
