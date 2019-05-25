import "../common-styles";
import jwt from "jsonwebtoken";
import { Component } from "react";
import { render } from "react-dom";
import styles from "./style.css";
import { Auth } from "../auth";
import { Config } from "../config";
import { getAnchorMode } from "../utils";
import { FollowButton } from "./follow-button";
import { FollowZone } from "./follow-zone";

class App extends Component {
  state = {
    animateOut: false,
    itemsHidden: false,
    /** @type {LiveItems} */
    liveItems: [],
    followUiOpen: false,
    componentMode: getAnchorMode() === "component",
    isBroadcaster: false,
    globalHide: false,
    playerUiVisible: false
  };

  /** @type {Config} */
  config;

  constructor(props) {
    super(props);
    if (typeof Twitch !== "undefined" && Twitch.ext) {
      this.config = new Config();
      this.config.configAvailable.then(() => {
        this.applyLiveStateFromConfig();
      });
      this.config.onLiveBroadcast = this.applyLiveStateFromConfig;
      Auth.authAvailable.then(() => {
        /** @type {Twitch.JwtToken} */
        const token = jwt.decode(Auth.token);
        if (token.role === "broadcaster") {
          this.setState({
            isBroadcaster: true
          });
        }
        Twitch.ext.actions.onFollow(this.onFollowUiClosed);
        Twitch.ext.onContext(context => {
          if (context.arePlayerControlsVisible !== this.state.playerUiVisible) {
            this.setState({
              playerUiVisible: context.arePlayerControlsVisible
            });
          }
        });
      });
    }
  }

  render() {
    if (this.state.componentMode) {
      return (
        <main>
          <div className={styles.componentMode}>
            {this.renderItem(
              this.state.liveItems.find(i => i.type === "button")
            )}
          </div>
        </main>
      );
    }

    return <main>{this.state.liveItems.map(this.renderItem)}</main>;
  }

  /**
   * @param {LiveLayoutItem} item
   */
  renderItem = item => {
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
          onClick={() => this.onFollowClick(item)}
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
          onClick={() => this.onFollowClick(item)}
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
      globalHide: newState.hideAll
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

  /**
   * @param {LiveLayoutItem} item
   */
  onFollowClick = item => {
    if (!item.channelName) {
      return;
    }
    Twitch.ext.actions.followChannel(item.channelName);
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
