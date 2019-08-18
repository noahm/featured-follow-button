import classNames from "classnames";
import { Component, CSSProperties } from "react";
import styles from "./animated-button.css";
import { LiveLayoutItem } from "../models";
import { FollowButton } from "./follow-button";

interface Props {
  item: LiveLayoutItem;
  disabled?: boolean;
  onClick?: () => void;
  onAnimationEnd?: () => void;
  animateOut?: boolean;
}

export class AnimatedButton extends Component<Props> {
  render() {
    const { item, disabled, onAnimationEnd, animateOut } = this.props;

    const style: CSSProperties = {
      top: item.top + "%",
      left: item.left + "%"
    };
    const classnames = classNames(styles.animation, styles.animationShow, {
      [styles.animationHide]: animateOut
    });

    return (
      <div onAnimationEnd={onAnimationEnd} className={classnames} style={style}>
        <div className={styles.animationSlide}>
          <FollowButton
            followChannel={item.channelName}
            disabled={disabled}
            onClick={this.props.onClick}
          >
            Follow {item.displayName || item.channelName}
          </FollowButton>
        </div>
      </div>
    );
  }
}
