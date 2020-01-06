import classNames from "classnames";
import { Component } from "react";
import styles from "./follow-zone.css";
import { LiveButton, PositionedZone, TrackingEvent } from "../models";

interface Props {
  item: LiveButton & PositionedZone;
  onClick: () => void;
  showBorder: boolean;
  disabled: boolean;
}

export class FollowZone extends Component<Props> {
  render() {
    const { item, disabled, showBorder } = this.props;

    const style = {
      top: item.top + "%",
      left: item.left + "%",
      height: item.height + "%",
      width: item.width + "%"
    };

    return (
      <div
        className={classNames(styles.followZone, {
          [styles.showBorder]: showBorder
        })}
        style={style}
        onClick={!disabled ? this.handleFollow : undefined}
      >
        <span className={styles.text}>
          Click to follow {item.displayName || item.channelName}
        </span>
      </div>
    );
  }

  private handleFollow = () => {
    this.props.onClick();
    Twitch.ext!.actions.followChannel(this.props.item.channelName);
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.FollowZoneClick,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Interact
    );
  };
}
