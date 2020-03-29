import "../common-styles";
import jwt from "jsonwebtoken";
import classNames from "classnames";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { ConfigProvider, ConfigContext } from "../config";
import { getAnchorMode, getIsPopout } from "../utils";
import { FollowZone } from "./follow-zone";
import { LiveLayoutItem, ChannelData, TrackingEvent } from "../models";
import { FollowList } from "./follow-list";
import { applyThemeClass, setTransparentBg } from "../common-styles";
import { hot } from "react-hot-loader/root";
import { FollowButton } from "./follow-button";

const anchorType = getAnchorMode();
const isPopout = getIsPopout();

interface Props {
  config: ChannelData;
}

interface State {
  isBroadcaster: boolean;
}

class App extends Component<Props, State> {
  state: State = {
    isBroadcaster: false
  };

  constructor(props: Props) {
    super(props);
    Auth.authAvailable.then(() => {
      const token = jwt.decode(Auth.token!) as null | Twitch.JwtToken;
      if (token && token.role === "broadcaster") {
        this.setState({
          isBroadcaster: true
        });
      }
      Twitch.ext!.actions.onFollow(this.onFollowUiClosed);
      if (anchorType === "video_overlay") {
        setTransparentBg();
      }
    });
  }

  render() {
    if (anchorType !== "video_overlay") {
      return (
        <main
          className={classNames(styles.componentMode, {
            [styles.popout]: isPopout
          })}
        >
          <FollowList />
        </main>
      );
    }

    return (
      <main className={styles.overlay}>
        {this.props.config.liveState.liveItems.map(this.renderItem)}
      </main>
    );
  }

  private renderItem = (item?: LiveLayoutItem) => {
    const { isBroadcaster } = this.state;
    const itemsHidden = this.props.config.liveState.hideAll && !isBroadcaster;

    if (itemsHidden || !item || !item.channelName) {
      return null;
    }

    if (item.type === "button") {
      return (
        <div
          style={{
            position: "absolute",
            top: `${item.top}%`,
            left: `${item.left}%`
          }}
          key={item.id + ":" + item.channelName}
        >
          <FollowButton
            channelLogin={item.channelName}
            channelDisplayName={item.displayName}
          />
        </div>
      );
    } else if (item.type === "zone") {
      return <FollowZone key={item.id} item={item} />;
    }
  };

  private onFollowUiClosed = (didFollow: boolean) => {
    if (didFollow) {
      Twitch.ext!.tracking.trackEvent(
        TrackingEvent.FollowConfirmed,
        Twitch.ext!.tracking.InteractionTypes.Click,
        Twitch.ext!.tracking.Categories.Interact
      );
    } else {
      Twitch.ext!.tracking.trackEvent(
        TrackingEvent.FollowAborted,
        Twitch.ext!.tracking.InteractionTypes.Click,
        Twitch.ext!.tracking.Categories.Interact
      );
    }
  };
}

const HotApp = hot(() => (
  <ConfigProvider>
    <ConfigContext.Consumer>
      {({ config }) => <App config={config} />}
    </ConfigContext.Consumer>
  </ConfigProvider>
));

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(<HotApp />, appNode);
applyThemeClass();
