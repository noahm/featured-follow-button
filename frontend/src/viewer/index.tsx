import "../common-styles";
import jwt from "jsonwebtoken";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { ConfigProvider, ConfigContext } from "../config";
import { getAnchorMode } from "../utils";
import { AnimatedButton } from "./animated-button";
import { FollowZone } from "./follow-zone";
import { LiveItems, LiveLayoutItem, ChannelData } from "../models";
import { FollowList } from "./follow-list";
import { applyThemeClass } from "../common-styles";

interface Props {
  config: ChannelData;
}

interface State {
  animateOut: boolean;
  itemsHidden: boolean;
  followUiOpen: boolean;
  componentMode: boolean;
  isBroadcaster: boolean;
  playerUiVisible: boolean;
}

class App extends Component<Props, State> {
  state: State = {
    animateOut: false,
    itemsHidden: false,
    followUiOpen: false,
    componentMode: getAnchorMode() === "component",
    isBroadcaster: false,
    playerUiVisible: false
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
      Twitch.ext!.onContext(context => {
        if (context.arePlayerControlsVisible !== this.state.playerUiVisible) {
          this.setState({
            playerUiVisible: context.arePlayerControlsVisible
          });
        }
      });
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
    if (this.state.componentMode) {
      return (
        <main className={styles.componentMode}>
          <FollowList
            disabled={this.state.followUiOpen}
            onFollowClick={this.onFollowClick}
          />
        </main>
      );
    }

    return (
      <main>{this.props.config.liveState.liveItems.map(this.renderItem)}</main>
    );
  }

  renderItem = (item?: LiveLayoutItem) => {
    const { itemsHidden, followUiOpen, isBroadcaster } = this.state;
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
          disabled={followUiOpen}
          onClick={this.onFollowClick}
          onAnimationEnd={this.animationEnded}
          item={item}
        />
      );
    } else if (item.type === "zone" && !animateOut) {
      return (
        <FollowZone
          key={item.id}
          disabled={followUiOpen}
          onClick={this.onFollowClick}
          item={item}
          showBorder={this.state.playerUiVisible}
        />
      );
    }
  };

  animationEnded = () => {
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

  onFollowClick = () => {
    this.setState({
      followUiOpen: true
    });
  };

  onFollowUiClosed = () => {
    this.setState({
      followUiOpen: false
    });
  };
}

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(
  <ConfigProvider>
    <ConfigContext.Consumer>
      {({ config }) => <App config={config} />}
    </ConfigContext.Consumer>
  </ConfigProvider>,
  appNode
);
applyThemeClass("dark");
