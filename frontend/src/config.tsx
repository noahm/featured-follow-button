import iassign from "immutable-assign";
import { createContext, Component } from "react";
import { Auth } from "./auth";
import {
  defaultLayout,
  getRandomID,
  TWITCH_UNAVAILABLE,
  debounce
} from "./utils";
import {
  ChannelData,
  LiveItems,
  LiveButton,
  Layout,
  LiveState,
  TrackingEvent,
  ListOptions,
  UserStyles
} from "./models";

const CONFIG_VERSION = "1.0";

const defaultConfig: ChannelData = {
  liveState: {
    liveItems: [],
    hideAll: false,
    styles: {
      zoneBorder: "",
      zoneBorderRadius: "",
      zoneTextColor: "",
      dropShadow: false,
      hideText: false
    },
    listOptions: {
      title: "",
      showAvatars: true,
      showDescriptions: false
    }
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
            top: 75
          }
        ]
      }
    ]
  }
};

export interface ConfigState {
  available: boolean;
  config: ChannelData;
  setLiveItems(liveItems: LiveItems, broadcast?: boolean): void;
  addQuickButton(item: LiveButton): void;
  /**
   * @param {Layout} layout
   * @param {boolean} localChange if true, change was made in this client, will broadcast to other clients
   */
  saveLayout(liveItems: Layout, broadcast?: boolean): void;
  toggleHideAll(): void;
  saveFavorites(favorites: Array<LiveButton>): void;
  /**
   * Updates display options for list mode.
   * Delays saving and publishing by 1s
   */
  saveListOptions(opts: Partial<ListOptions>): void;
  /**
   * Updates style options for follow zones.
   * Delays saving and publishing by 1s
   */
  saveUserStyles(opts: Partial<UserStyles>): void;
}

export const ConfigContext = createContext<ConfigState>({
  available: false,
  config: defaultConfig,
  setLiveItems: () => null,
  addQuickButton: () => null,
  saveLayout: () => null,
  toggleHideAll: () => null,
  saveFavorites: () => null,
  saveListOptions: () => null,
  saveUserStyles: () => null
});

export class ConfigProvider extends Component<{}, ConfigState> {
  public state: ConfigState = {
    available: false,
    config: defaultConfig,

    setLiveItems: (liveItems, localChange = true) => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            c => c.config.liveState,
            liveState => {
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

    addQuickButton: item => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            c => c.config.liveState.liveItems,
            liveItems => {
              liveItems.push({
                type: "quick",
                id: getRandomID(),
                ...item
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
        prevState =>
          iassign(
            prevState,
            c => c.config.liveState,
            liveState => {
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
        config => config.config.settings,
        settings => {
          settings.configuredLayouts = [layout];
          return settings;
        }
      );
      const availableSlots = new Map(
        newState.config.settings.configuredLayouts[0].positions.map(item => [
          item.id,
          item
        ])
      );
      const validLiveItems = newState.config.liveState.liveItems
        .filter(item => availableSlots.has(item.id))
        .map(item => {
          const parentSlot = availableSlots.get(item.id);
          return {
            ...item,
            ...parentSlot
          };
        });

      // if we had any live buttons to begin with, update them
      if (newState.config.liveState.liveItems.length) {
        newState = iassign(
          newState,
          state => state.config.liveState.liveItems,
          () => validLiveItems
        );
      }

      this.setState(newState, () => {
        if (localChange) {
          // TODO use debounced save here and delete save button from layout editor
          this.save();
          this.publishLayout();
        }
      });
    },

    saveFavorites: (favorites: Array<LiveButton>) => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            config => config.config.settings,
            settings => {
              settings.favorites = favorites.slice();
              return settings;
            }
          ),
        this.save
      );
    },

    saveListOptions: (opts: Partial<ListOptions>) => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            config => config.config.liveState.listOptions,
            current => ({ ...current, ...opts })
          ),
        this.delayLiveSave
      );
    },

    saveUserStyles: opts => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            c => c.config.liveState.styles,
            styles => ({ ...styles, ...opts })
          ),
        this.delayLiveSave
      );
    }
  };

  private delayLiveSave = debounce(() => {
    this.publishLiveState();
    this.save();
  }, 1000);

  constructor(props: {}) {
    super(props);
    new Promise(resolve => {
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
        this.setState(prevState =>
          iassign(
            prevState,
            c => c.config.liveState,
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
          ...JSON.parse(Twitch.ext!.configuration.broadcaster!.content || "{}")
        };

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
        }

        if (!ret.settings.configuredLayouts.length) {
          ret.settings.configuredLayouts = [defaultLayout];
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
    Twitch.ext!.tracking.trackEvent(
      TrackingEvent.LiveStateSave,
      Twitch.ext!.tracking.InteractionTypes.Click,
      Twitch.ext!.tracking.Categories.Configuration
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
