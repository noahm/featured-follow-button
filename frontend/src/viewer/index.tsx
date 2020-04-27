import "../common-styles";
import jwt from "jsonwebtoken";
import classNames from "classnames";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { ConfigProvider, ConfigContext } from "../config";
import { getAnchorMode, getIsPopout } from "../utils";
import { ChannelData, TrackingEvent } from "../models";
import { FollowList } from "./follow-list";
import { applyThemeClass, setTransparentBg } from "../common-styles";
import { hot } from "react-hot-loader/root";
import { OverlayView } from "./overlay";

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
    isBroadcaster: false,
  };

  constructor(props: Props) {
    super(props);
    Auth.authAvailable.then(() => {
      const token = jwt.decode(Auth.token!) as null | Twitch.JwtToken;
      if (token && token.role === "broadcaster") {
        this.setState({
          isBroadcaster: true,
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
            [styles.popout]: isPopout,
          })}
        >
          <FollowList />
        </main>
      );
    }

    return (
      <OverlayView
        isBroadcaster={this.state.isBroadcaster}
        liveState={this.props.config.liveState}
      />
    );
  }

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

if (!document.querySelector("#app")) {
  const appNode = document.createElement("div");
  appNode.id = "app";
  document.body.appendChild(appNode);
  render(<HotApp />, appNode);
  applyThemeClass();
}
