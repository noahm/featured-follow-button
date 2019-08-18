import iassign from "immutable-assign";
import { createContext, Component } from "react";
import { Auth } from "./auth";
import { defaultLayout } from "./utils";
import {
  ChannelData,
  LiveItems,
  LiveButton,
  Layout,
  LiveState
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
    configuredLayouts: []
  }
};

export interface ConfigState {
  available: boolean;
  config: ChannelData;
  setLiveItems(liveItems: LiveItems, broadcast?: boolean): void;
  saveLayout(liveItems: Layout, broadcast?: boolean): void;
  toggleHideAll(): void;
  saveFavorites(favorites: Array<LiveButton>): void;
  saveComponentHeader(header: string): void;
}

export const ConfigContext = createContext<ConfigState>({
  available: false,
  config: defaultConfig,
  setLiveItems: () => null,
  saveLayout: () => null,
  toggleHideAll: () => null,
  saveFavorites: () => null,
  saveComponentHeader: () => null
});

export class ConfigProvider extends Component<{}, ConfigState> {
  public state = {
    available: false,
    config: defaultConfig,

    setLiveItems: (liveItems: LiveItems, broadcast = true) => {
      this.config = iassign(
        this.config,
        c => c.liveState,
        liveState => {
          liveState.liveItems = liveItems.slice();
          return liveState;
        }
      );

      if (broadcast) {
        // set configuration
        this.save();
        // broadcast to pubsub
        this.publishLiveState();
      }
    },

    toggleHideAll: () => {
      this.config = iassign(
        this.config,
        c => c.liveState,
        liveState => {
          liveState.hideAll = !liveState.hideAll;
          return liveState;
        }
      );
      this.save();
      this.publishLiveState();
    },

    /**
     * @param {Layout} layout
     * @param {boolean} broadcast if true, will broadcast to other clients
     */
    saveLayout: (layout: Layout, broadcast = true) => {
      this.config = iassign(
        this.config,
        config => config.settings,
        settings => {
          settings.configuredLayouts = [layout];
          return settings;
        }
      );
      const availableSlots = new Map(
        this.config.settings.configuredLayouts[0].positions.map(
          /** @return {[string, LayoutItem]} */ item => [item.id, item]
        )
      );
      const validLiveItems = this.config.liveState.liveItems
        .filter(item => availableSlots.has(item.id))
        .map(item => {
          const parentSlot = availableSlots.get(item.id);
          return {
            ...item,
            ...parentSlot
          };
        });

      // if we had any live buttons to begin with, update them
      if (this.config.liveState.liveItems.length) {
        this.state.setLiveItems(validLiveItems, broadcast);
      } else if (broadcast) {
        this.save();
      }

      if (broadcast) {
        this.publishLayout();
      }
    },

    saveFavorites: (favorites: Array<LiveButton>) => {
      this.config = iassign(
        this.config,
        config => config.settings,
        settings => {
          settings.favorites = favorites.slice();
          return settings;
        }
      );
      this.save();
    },

    saveComponentHeader: (header: string) => {
      this.config = iassign(
        this.config,
        config => config.liveState,
        liveState => {
          liveState.componentHeader = header;
          return liveState;
        }
      );
      this.publishLiveState();
      this.save();
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
        this.config = this.getConfiguration();
        resolve();
      });

      const availableConfig = this.getConfiguration();
      if (availableConfig !== defaultConfig) {
        this.config = availableConfig;
        resolve();
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
        this.config = iassign(
          this.config,
          c => c.liveState,
          () => decodedMessage
        );
      }
    } catch (_) {}
  };

  private getConfiguration() {
    // return defaultConfig;
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
  }

  private get config() {
    return this.state.config;
  }

  private set config(config: ChannelData) {
    this.setState({
      config
    });
  }
}
