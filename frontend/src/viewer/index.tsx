import "../common-styles";
import classNames from "classnames";
import jwt from "jsonwebtoken";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { Config } from "../config";
import { getAnchorMode } from "../utils";
import { FollowButton } from "./follow-button";
import { FollowZone } from "./follow-zone";
import { LiveItems, LiveLayoutItem } from "../models";
import { FollowList } from "./follow-list";

interface State {
  animateOut: boolean;
  itemsHidden: boolean;
  componentHeader: string;
  liveItems: LiveItems;
  followUiOpen: boolean;
  componentMode: boolean;
  isBroadcaster: boolean;
  globalHide: boolean;
  playerUiVisible: boolean;
}

class App extends Component<{}, State> {
  state: State = {
    animateOut: false,
    itemsHidden: false,
    componentHeader: '',
    liveItems: [],
    followUiOpen: false,
    componentMode: getAnchorMode() === "component",
    isBroadcaster: false,
    globalHide: false,
    playerUiVisible: false
  };

  config: Config;

  constructor(props: {}) {
    super(props);
    this.config = new Config();
    this.config.configAvailable.then(() => {
      this.applyLiveStateFromConfig();
    });
    this.config.onLiveBroadcast = this.applyLiveStateFromConfig;
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

  render() {
    if (this.state.componentMode) {
      return (
        <FollowList
          title={this.state.componentHeader}
          items={this.state.animateOut ? [] : this.state.liveItems}
          disabled={this.state.followUiOpen}
          onFollowClick={this.onFollowClick}
        />
      );
    }

    return <main>{this.state.liveItems.map(this.renderItem)}</main>;
  }

  renderItem = (item?: LiveLayoutItem) => {
    const {
      itemsHidden,
      followUiOpen,
      componentMode,
      isBroadcaster
    } = this.state;
    let animateOut = this.state.animateOut;
    if (this.state.globalHide) {
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
        <FollowButton
          key={item.id + ":" + item.channelName}
          animateOut={animateOut}
          disabled={followUiOpen}
          onClick={this.onFollowClick}
          onAnimationEnd={this.animationEnded}
          item={item}
          componentMode={componentMode}
        />
      );
    } else if (!animateOut) {
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
        (this.state.globalHide && !this.state.isBroadcaster)) &&
      !this.state.itemsHidden
    ) {
      this.setState({
        itemsHidden: true
      });
    }
  };

  applyLiveStateFromConfig = () => {
    const newState = this.config.liveState;
    this.setState({
      globalHide: newState.hideAll,
      componentHeader: newState.componentHeader,
    });

    if (
      this.state.liveItems.length &&
      !newState.liveItems.length &&
      !this.state.animateOut &&
      !newState.hideAll
    ) {
      this.setState({
        animateOut: true
      });
      return;
    }
    this.setState({
      animateOut: false,
      itemsHidden: false,
      liveItems: newState.liveItems
    });
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
render(<App />, appNode);
