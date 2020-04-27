import classNames from "classnames";
import styles from "./follow-button.css";
import { TrackingEvent } from "../models";
import { useContext } from "react";
import { ConfigContext } from "../config";

interface FBProps {
  disabled?: boolean;
  /**
   * Button is a preview and will do nothing when clicked
   */
  preview?: boolean;
  onClick?: () => void;
  channelLogin: string;
  channelDisplayName?: string;
  forceTemplate?: string;
  disableTheme?: boolean;
}

function Heart() {
  return (
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
  );
}

const subTokens = /HEART|CHANNEL_NAME|CHANNEL_LOGIN/g;

function tokenizeTemplate(template: string) {
  const nonTokens = template.split(subTokens);
  const tokens = template.match(subTokens);
  // zipper merge the two arrays
  const ret = [nonTokens.shift()];
  while (nonTokens.length) {
    ret.push(tokens?.shift());
    ret.push(nonTokens.shift());
  }
  return ret;
}

export function FollowButton(props: FBProps) {
  const { disabled, onClick, channelLogin, preview, disableTheme } = props;
  const {
    config: {
      liveState: { styles: userStyles },
    },
  } = useContext(ConfigContext);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    Twitch.ext!.actions.followChannel(channelLogin);
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.FollowButtonClick,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Interact,
      `channel:${channelLogin}`
    );
  };

  const useTheme = !disableTheme;

  const template =
    props.forceTemplate ||
    (useTheme && userStyles.buttonTemplate) ||
    "HEART Follow CHANNEL_NAME";
  const contents = tokenizeTemplate(template).map((token, index) => {
    switch (token) {
      case "HEART":
        return <Heart key={index} />;
      case "CHANNEL_NAME":
        return props.channelDisplayName || props.channelLogin;
      case "CHANNEL_LOGIN":
        return props.channelLogin;
      default:
        return token;
    }
  });

  let style: Record<string, string> = {};
  if (useTheme) {
    style["--bg-color"] = userStyles.buttonBaseColor;
    style["--border-radius"] = userStyles.buttonBorderRadius;
    style["--shadow-color"] = userStyles.buttonShadowColor;
    style["--text-color"] = userStyles.buttonTextColor;
    style["--text-padding"] = userStyles.buttonPadding;
    style.fontSize = userStyles.buttonTextSize / 100 + "em";
  }

  return (
    <button
      disabled={disabled}
      className={classNames(
        styles.button,
        "custom",
        useTheme && styles.custom,
        {
          [styles.empty]: template === "HEART",
          [styles[`shadow-${userStyles.buttonShadowDirection}`]]: useTheme,
        }
      )}
      style={style}
      onClick={!preview ? handleClick : undefined}
    >
      <span className={styles.buttonText}>{contents}</span>
    </button>
  );
}
