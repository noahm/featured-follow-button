import classNames from "classnames";
import { useContext } from "react";
import styles from "./follow-zone.css";
import { LiveButton, PositionedZone, TrackingEvent } from "../models";
import { ConfigContext } from "../config";

interface Props {
  item: LiveButton & PositionedZone;
  onClick?: () => void;
  disabled?: boolean;
}

export function FollowZone(props: Props) {
  const { item, disabled, onClick } = props;
  const { config } = useContext(ConfigContext);
  const {
    zoneBorder,
    zoneBorderRadius,
    zoneTextColor,
    dropShadow
  } = config.liveState.styles;

  function handleFollow() {
    onClick && onClick();
    Twitch.ext!.actions.followChannel(item.channelName);
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.FollowZoneClick,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Interact
    );
  }

  const style = {
    top: item.top + "%",
    left: item.left + "%",
    height: item.height + "%",
    width: item.width + "%",
    borderRadius: zoneBorderRadius || undefined,
    border: zoneBorder || undefined
  };

  const textStyle = {
    color: zoneTextColor || undefined
  };

  return (
    <div
      className={classNames(styles.followZone, {
        [styles.withShadow]: dropShadow
      })}
      style={style}
      onClick={!disabled ? handleFollow : undefined}
    >
      <span className={styles.text} style={textStyle}>
        Click to follow {item.displayName || item.channelName}
      </span>
    </div>
  );
}
