import iassign from "immutable-assign";
import { createContext, Component } from "react";
import { Auth } from "./auth";
import { defaultLayout, getRandomID } from "./utils";
import {
  ChannelData,
  LiveItems,
  LiveButton,
  Layout,
  LiveState,
  TrackingEvent
} from "./models";

const CONFIG_VERSION = "1.0";

const defaultConfig: ChannelData = {
  liveState: {
    liveItems: [],
    hideAll: false,
    componentHeader: ""
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
  saveComponentHeader(header: string): void;
}

export const ConfigContext = createContext<ConfigState>({
  available: false,
  config: defaultConfig,
  setLiveItems: () => null,
  addQuickButton: () => null,
  saveLayout: () => null,
  toggleHideAll: () => null,
  saveFavorites: () => null,
  saveComponentHeader: () => null
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

    saveComponentHeader: (header: string) => {
      this.setState(
        prevState =>
          iassign(
            prevState,
            config => config.config.liveState,
            liveState => {
              liveState.componentHeader = header;
              return liveState;
            }
          ),
        () => {
          this.publishLiveState();
          this.save();
        }
      );
    }
  };

  constructor(props: {}) {
    super(props);
    new Promise(resolve => {
      if (typeof Twitch === "undefined" || !Twitch.ext) {
        console.error("Twitch ext not present. Config not available.");
        return;
      }

      Twitch.ext.configuration.onChanged(() => {
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
        {this.props.children}
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

  private getConfiguration() {
    let ret = defaultConfig;
    try {
      if (Twitch.ext!.configuration.broadcaster!.version === CONFIG_VERSION) {
        ret = {
          ...defaultConfig,
          ...JSON.parse(Twitch.ext!.configuration.broadcaster!.content || "{}")
        };
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
      Twitch.ext!.tracking.InteractionTypes.Configuration,
      Twitch.ext!.tracking.Categories.Click
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
      Twitch.ext!.tracking.InteractionTypes.Configuration,
      Twitch.ext!.tracking.Categories.Click
    );
  }

  private get config() {
    return this.state.config;
  }
}
