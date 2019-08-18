import classNames from "classnames";
import { Component } from "react";
import styles from "./follow-button.css";

interface FBProps {
  disabled?: boolean;
  onClick?: () => void;
  followChannel: string;
}

export class FollowButton extends Component<FBProps> {
  public render() {
    return (
      <button
        disabled={this.props.disabled}
        className={classNames(styles.button, {
          [styles.empty]: !this.props.children
        })}
        onClick={this.handleClick}
      >
        <span className={styles.buttonText}>
          <svg
            width="16px"
            height="16px"
            version="1.1"
            viewBox="0 0 16 16"
            x="0px"
            y="0px"
          >
            <path
              clipRule="evenodd"
              d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z"
              fillRule="evenodd"
            />
          </svg>
          {this.props.children}
        </span>
      </button>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
    Twitch.ext!.actions.followChannel(this.props.followChannel);
  };
}
