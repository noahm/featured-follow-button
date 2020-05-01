import classNames from "classnames";
import { useContext, CSSProperties } from "react";
import styles from "./follow-zone.css";
import { LiveButton, PositionedZone, TrackingEvent } from "../models";
import { ConfigContext } from "../config";
import { getZoneStyles } from "../utils";

interface Props {
  item: LiveButton & PositionedZone;
  onClick?: () => void;
  disabled?: boolean;
}

export function FollowZone(props: Props) {
  const { item, disabled, onClick } = props;
  const { config } = useContext(ConfigContext);
  const {
    zoneBorderVisible,
    zoneShadowStrength,
    zoneTextVisible,
  } = config.liveState.styles;

  function handleFollow() {
    onClick && onClick();
    Twitch.ext!.actions.followChannel(item.channelName);
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.FollowZoneClick,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Interact,
      `channel:${item.channelName}`
    );
  }

  const style = getZoneStyles(item, config.liveState.styles);

  return (
    <div
      className={classNames(styles.followZone, {
        [styles.withShadow]: !!zoneShadowStrength,
        [styles.textOnHover]: zoneTextVisible === "hover",
        [styles.textAlways]: zoneTextVisible === "always",
        [styles.borderOnHover]: zoneBorderVisible === "hover",
        [styles.borderAlways]: zoneBorderVisible === "always",
      })}
      style={style}
      onClick={!disabled ? handleFollow : undefined}
    >
      <span className={styles.text}>
        Click to follow {item.displayName || item.channelName}
      </span>
    </div>
  );
}
