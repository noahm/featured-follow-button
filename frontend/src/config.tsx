import iassign from "immutable-assign";
import { createContext, Component } from "react";
import { Auth } from "./auth";
import { defaultLayout, getRandomID, TWITCH_UNAVAILABLE } from "./utils";
import {
  ChannelData,
  LiveItems,
  LiveButton,
  Layout,
  LiveState,
  TrackingEvent,
  ListOptions,
  UserStyles,
} from "./models";

const CONFIG_VERSION = "1.0";

const defaultConfig: ChannelData = {
  liveState: {
    liveItems: [],
    hideAll: false,
    styles: {
      zoneBorderColor: "#778899",
      zoneBorderStyle: "dashed",
      zoneBorderWidth: 2,
      zoneBorderRadius: "0%",
      zoneTextColor: "#000000",
      zoneShadowStrength: 0,
      zoneShadowColor: "#ffffff",
      zoneTextHidden: false,
      zoneTextAlign: "C",
      zoneTextSize: 1,
      zoneTextWeight: "bold",
      customButtonStyle: false,
      buttonBaseColor: "#9147ff",
      buttonTextColor: "#ffffff",
      buttonShadowColor: "#ffffff",
      buttonShadowDirection: "",
      buttonPadding: "0.4em 0.7em",
      buttonBorderRadius: "0.4em",
      buttonTemplate: "",
    },
    listOptions: {
      title: "",
      showAvatars: true,
      showDescriptions: false,
    },
  },
  settings: {
    favorites: [],
    configuredLayouts: [
      {
        name: "default",
        positions: [
          {
            id: "00000000",
            type: "button",
            left: 75,
            top: 75,
            align: "right",
          },
        ],
      },
    ],
  },
};

export interface ConfigState {
  available: boolean;
  unpublished: boolean;
  config: ChannelData;
  setLiveItems(liveItems: LiveItems, broadcast?: boolean): void;
  addQuickButton(item: LiveButton): void;
  /**
   * @param {Layout} layout
   * @param {boolean} localChange if true, change was made in this client, will mark changes as pending save
   */
  saveLayout(liveItems: Layout, localChange?: boolean): void;
  toggleHideAll(): void;
  saveFavorites(favorites: Array<LiveButton>): void;
  /**
   * Updates display options for list mode.
   * Does not save or publish
   */
  saveListOptions(opts: Partial<ListOptions>): void;
  /**
   * Updates style options for follow zones.
   * Does not save or publish
   */
  saveUserStyles(opts: Partial<UserStyles>): void;
  /**
   * Save and publish any unsaved changes in state.
   */
  saveAndPublish(): void;
}

export const ConfigContext = createContext<ConfigState>({
  available: false,
  unpublished: false,
  config: defaultConfig,
  setLiveItems: () => null,
  addQuickButton: () => null,
  saveLayout: () => null,
  toggleHideAll: () => null,
  saveFavorites: () => null,
  saveListOptions: () => null,
  saveUserStyles: () => null,
  saveAndPublish: () => null,
});

export class ConfigProvider extends Component<{}, ConfigState> {
  public state: ConfigState = {
    available: false,
    unpublished: false,
    config: defaultConfig,

    setLiveItems: (liveItems, localChange = true) => {
      this.setState(
        (prevState) =>
          iassign(
            prevState,
            (c) => c.config.liveState,
            (liveState) => {
              liveState.liveItems = liveItems.slice();
              return liveState;
            }
          ),
        () => {
          if (localChange) {
            // set configuration
            this.save();
            // broadcast to pubsub
            this.publishLiveState();
          }
        }
      );
    },

    addQuickButton: (item) => {
      this.setState(
        (prevState) =>
          iassign(
            prevState,
            (c) => c.config.liveState.liveItems,
            (liveItems) => {
              liveItems.push({
                type: "quick",
                id: getRandomID(),
                ...item,
              });
              return liveItems;
            }
          ),
        () => {
          this.save();
          this.publishLiveState();
        }
      );
    },

    toggleHideAll: () => {
      this.setState(
        (prevState) =>
          iassign(
            prevState,
            (c) => c.config.liveState,
            (liveState) => {
              liveState.hideAll = !liveState.hideAll;
              return liveState;
            }
          ),
        () => {
          this.save();
          this.publishLiveState();
        }
      );
    },

    saveLayout: (layout: Layout, localChange = true) => {
      let newState = iassign(
        this.state,
        (config) => config.config.settings,
        (settings) => {
          settings.configuredLayouts = [layout];
          return settings;
        }
      );
      const availableSlots = new Map(
        newState.config.settings.configuredLayouts[0].positions.map((item) => [
          item.id,
          item,
        ])
      );
      const validLiveItems = newState.config.liveState.liveItems
        .filter((item) => availableSlots.has(item.id))
        .map((item) => {
          const parentSlot = availableSlots.get(item.id);
          return {
            ...item,
            ...parentSlot,
          };
        });

      // if we had any live buttons to begin with, update them
      if (newState.config.liveState.liveItems.length) {
        newState = iassign(
          newState,
          (state) => state.config.liveState.liveItems,
          () => validLiveItems
        );
      }

      this.setState(newState);
      if (localChange) {
        this.setState({
          unpublished: true,
        });
      }
    },

    saveFavorites: (favorites: Array<LiveButton>) => {
      this.setState(
        (prevState) =>
          iassign(
            prevState,
            (config) => config.config.settings,
            (settings) => {
              settings.favorites = favorites.slice();
              return settings;
            }
          ),
        this.save
      );
    },

    saveListOptions: (opts: Partial<ListOptions>) => {
      this.setState((prevState) => ({
        unpublished: true,
        config: iassign(
          prevState.config,
          (config) => config.liveState.listOptions,
          (current) => ({ ...current, ...opts })
        ),
      }));
    },

    saveUserStyles: (opts) => {
      this.setState((prevState) => ({
        unpublished: true,
        config: iassign(
          prevState.config,
          (c) => c.liveState.styles,
          (styles) => ({ ...styles, ...opts })
        ),
      }));
    },

    saveAndPublish: () => {
      this.save();
      this.publishLiveState();
      this.publishLayout();
      this.setState({
        unpublished: false,
      });
    },
  };

  public componentDidMount() {
    new Promise((resolve) => {
      if (TWITCH_UNAVAILABLE) {
        console.error("Twitch ext not present. Config not available.");
        return;
      }

      Twitch.ext!.configuration.onChanged(() => {
        this.setState({ config: this.getConfiguration() }, resolve);
      });

      const availableConfig = this.getConfiguration();
      if (availableConfig !== defaultConfig) {
        this.setState({ config: availableConfig }, resolve);
      }

      Auth.authAvailable.then(() => {
        Twitch.ext!.listen(
          `whisper-${Auth.userID}`,
          this.handleLayoutBroadcast
        );
        Twitch.ext!.listen("broadcast", this.handleLiveBroadcast);
      });
    }).then(() => {
      this.setState({ available: true });
    });
  }

  public render() {
    return (
      <ConfigContext.Provider value={this.state}>
        {(this.state.available || TWITCH_UNAVAILABLE) && this.props.children}
      </ConfigContext.Provider>
    );
  }

  private handleLayoutBroadcast: Twitch.PubsubCallback = (
    target,
    contentType,
    message
  ) => {
    try {
      /** @type {Layout} */
      const decodedMessage = JSON.parse(message);
      if (decodedMessage) {
        this.state.saveLayout(decodedMessage, false);
      }
    } catch (_) {}
  };

  private handleLiveBroadcast: Twitch.PubsubCallback = (
    target,
    contentType,
    message
  ) => {
    try {
      const decodedMessage: LiveState = JSON.parse(message);
      if (decodedMessage) {
        this.setState((prevState) =>
          iassign(
            prevState,
            (c) => c.config.liveState,
            () => decodedMessage
          )
        );
      }
    } catch (_) {}
  };

  /** retrieve saved config from twitch, migrate values as necessary */
  private getConfiguration() {
    let ret = defaultConfig;
    try {
      if (Twitch.ext!.configuration.broadcaster!.version === CONFIG_VERSION) {
        ret = {
          ...defaultConfig,
          ...JSON.parse(Twitch.ext!.configuration.broadcaster!.content || "{}"),
        };

        if (!ret.settings.configuredLayouts.length) {
          ret.settings.configuredLayouts = [defaultLayout];
        }

        // migrate old button layout items to have align property
        for (const item of ret.liveState.liveItems) {
          if (item.type === "button" && !item.align) {
            item.align = "left";
          }
        }
        for (const item of ret.settings.configuredLayouts[0].positions) {
          if (item.type === "button" && !item.align) {
            item.align = "left";
          }
        }

        // migrate componentHeader to listOptions
        if (!ret.liveState.listOptions) {
          ret.liveState.listOptions = defaultConfig.liveState.listOptions;
        }
        if (ret.liveState.componentHeader) {
          ret.liveState.listOptions.title = ret.liveState.componentHeader;
          delete ret.liveState.componentHeader;
        }

        if (!ret.liveState.styles) {
          ret.liveState.styles = defaultConfig.liveState.styles;
        } else {
          // fill in possibly missing style values
          ret.liveState.styles = {
            ...defaultConfig.liveState.styles,
            ...ret.liveState.styles,
          };
        }
      }
    } finally {
      return ret;
    }
  }

  private save() {
    Twitch.ext!.configuration.set(
      "broadcaster",
      CONFIG_VERSION,
      JSON.stringify(this.config)
    );
  }

  private publishLiveState() {
    Twitch.ext!.send("broadcast", "application/json", this.config.liveState);
    const channels = new Set(
      this.config.liveState.liveItems.map((item) => item.channelName)
    );
    const customMetadata = Array.from(channels)
      .map((item) => `channel:${item}`)
      .join(";");
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.LiveStateSave,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Configuration,
      customMetadata.length < 100 ? customMetadata : undefined
    );
  }

  private publishLayout() {
    if (!Auth.userID) {
      return;
    }
    Twitch.ext!.send(
      `whisper-${Auth.userID}`,
      "application/json",
      this.config.settings.configuredLayouts[0]
    );
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.LayoutSave,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Configuration
    );
  }

  private get config() {
    return this.state.config;
  }
}
