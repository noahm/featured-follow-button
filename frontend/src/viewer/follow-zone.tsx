import classNames from "classnames";
import { useContext, CSSProperties } from "react";
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
    zoneBorderColor,
    zoneBorderStyle,
    zoneBorderWidth,
    zoneBorderRadius,
    zoneTextColor,
    zoneShadowColor,
    zoneShadowStrength,
    zoneTextHidden,
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

  const style: Record<string, string | undefined> = {
    top: item.top + "%",
    left: item.left + "%",
    height: item.height + "%",
    width: item.width + "%",
    borderRadius: zoneBorderRadius || undefined,
    borderWidth: `${zoneBorderWidth}px`,
    borderStyle: zoneBorderStyle,
    borderColor: zoneBorderColor,
  };
  if (zoneShadowColor) {
    style["--shadow-color"] = zoneShadowColor;
  }
  if (zoneShadowStrength) {
    style["--shadow-strength"] = `${zoneShadowStrength}px`;
  }

  const textStyle = {
    color: zoneTextColor || undefined,
  };

  return (
    <div
      className={classNames(styles.followZone, {
        [styles.withShadow]: !!zoneShadowStrength,
        [styles.textOnHover]: !zoneTextHidden,
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
