import "../common-styles";
import jwt from "jsonwebtoken";
import classNames from "classnames";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { ConfigProvider, ConfigContext } from "../config";
import { getAnchorMode, getIsPopout } from "../utils";
import { AnimatedButton } from "./animated-button";
import { FollowZone } from "./follow-zone";
import { LiveLayoutItem, ChannelData, TrackingEvent } from "../models";
import { FollowList } from "./follow-list";
import { applyThemeClass, setTransparentBg } from "../common-styles";
import { hot } from "react-hot-loader/root";

const anchorType = getAnchorMode();
const isPopout = getIsPopout();

interface Props {
  config: ChannelData;
}

interface State {
  animateOut: boolean;
  itemsHidden: boolean;
  // followUiOpen: boolean;
  isBroadcaster: boolean;
}

class App extends Component<Props, State> {
  state: State = {
    animateOut: false,
    itemsHidden: false,
    // followUiOpen: false,
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.config.liveState !== this.props.config.liveState) {
      if (
        prevProps.config.liveState.liveItems.length &&
        !this.props.config.liveState.liveItems.length &&
        !this.state.animateOut &&
        !this.props.config.liveState.hideAll
      ) {
        this.setState({
          animateOut: true
        });
        return;
      }
      this.setState({
        animateOut: false,
        itemsHidden: false
      });
    }
  }

  render() {
    if (anchorType !== "video_overlay") {
      return (
        <main
          className={classNames(styles.componentMode, {
            [styles.popout]: isPopout
          })}
        >
          <FollowList
          // disabled={this.state.followUiOpen}
          // onFollowClick={this.onFollowClick}
          />
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
    const { itemsHidden, isBroadcaster } = this.state;
    let animateOut = this.state.animateOut;
    if (this.props.config.liveState.hideAll) {
      if (isBroadcaster) {
        animateOut = false;
      } else {
        animateOut = true;
      }
    }

    if (itemsHidden || !item || !item.channelName) {
      return null;
    }

    if (item.type === "button") {
      return (
        <AnimatedButton
          key={item.id + ":" + item.channelName}
          animateOut={animateOut}
          // disabled={followUiOpen}
          // onClick={this.onFollowClick}
          onAnimationEnd={this.animationEnded}
          item={item}
        />
      );
    } else if (item.type === "zone" && !animateOut) {
      return (
        <FollowZone
          key={item.id}
          // disabled={followUiOpen}
          // onClick={this.onFollowClick}
          item={item}
        />
      );
    }
  };

  private animationEnded = () => {
    if (
      (this.state.animateOut ||
        (this.props.config.liveState.hideAll && !this.state.isBroadcaster)) &&
      !this.state.itemsHidden
    ) {
      this.setState({
        itemsHidden: true
      });
    }
  };

  // private onFollowClick = () => {
  //   this.setState({
  //     followUiOpen: true
  //   });
  // };

  private onFollowUiClosed = (didFollow: boolean) => {
    // this.setState({
    //   followUiOpen: false
    // });
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
