import classNames from "classnames";
import { Component, CSSProperties } from "react";
import styles from "./animated-button.css";
import { PositionedButton, LiveButton } from "../models";
import { FollowButton } from "./follow-button";

interface Props {
  item: PositionedButton & LiveButton;
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
            channelLogin={item.channelName}
            channelDisplayName={item.displayName}
            disabled={disabled}
            onClick={this.props.onClick}
          />
        </div>
      </div>
    );
  }
}
