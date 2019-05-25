// @ts-check
import iassign from "immutable-assign";
import "../../models";
import { Auth } from "./auth";
import { defaultLayout } from "./utils";

const CONFIG_VERSION = "1.0";

/** @type {ChannelData} */
const defaultConfig = {
  liveState: {
    liveItems: [],
    hideAll: false,
    componentAlignment: undefined
  },
  settings: {
    favorites: [],
    configuredLayouts: []
  }
};

export class Config {
  /**
   * @private
   * @type {ChannelData}
   */
  config;

  /**
   * @readonly
   * @type {Promise<void>}
   */
  configAvailable;

  /**
   * @public
   * @type {undefined | (() => void)}
   */
  onLayoutBroadcast;

  /**
   * @public
   * @type {undefined | (() => void)}
   */
  onLiveBroadcast;

  constructor() {
    if (typeof Twitch === "undefined" || !Twitch.ext) {
      console.error("Twitch ext not present. Config not available.");
      return;
    }

    this.configAvailable = new Promise(resolve => {
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
        Twitch.ext.listen(`whisper-${Auth.userID}`, this.handleLayoutBroadcast);
        Twitch.ext.listen("broadcast", this.handleLiveBroadcast);
      });
    });
  }

  /**
   * @private
   */
  handleLayoutBroadcast = (target, contentType, message) => {
    try {
      /** @type {Layout} */
      const decodedMessage = JSON.parse(message);
      if (decodedMessage) {
        this.saveLayout(decodedMessage, false);
        if (this.onLayoutBroadcast) {
          this.onLayoutBroadcast();
        }
      }
    } catch (_) {}
  };

  /**
   * @private
   */
  handleLiveBroadcast = (target, contentType, message) => {
    try {
      /** @type {LiveState} */
      const decodedMessage = JSON.parse(message);
      if (decodedMessage) {
        this.config = iassign(
          this.config,
          c => c.liveState,
          () => decodedMessage
        );

        if (this.onLiveBroadcast) {
          this.onLiveBroadcast();
        }
      }
    } catch (_) {}
  };

  /**
   * @private
   */
  getConfiguration() {
    // return defaultConfig;
    let ret = defaultConfig;
    try {
      if (Twitch.ext.configuration.broadcaster.version === CONFIG_VERSION) {
        ret = {
          ...defaultConfig,
          ...JSON.parse(Twitch.ext.configuration.broadcaster.content)
        };
        if (!ret.settings.configuredLayouts.length) {
          ret.settings.configuredLayouts = [defaultLayout];
        }
      }
    } finally {
      return ret;
    }
  }

  /**
   * @private
   */
  save() {
    Twitch.ext.configuration.set(
      "broadcaster",
      CONFIG_VERSION,
      JSON.stringify(this.config)
    );
  }

  /**
   * @private
   */
  publishLiveState() {
    Twitch.ext.send("broadcast", "application/json", this.config.liveState);
  }

  /**
   * @private
   */
  publishLayout() {
    if (!Auth.userID) {
      return;
    }
    Twitch.ext.send(
      `whisper-${Auth.userID}`,
      "application/json",
      this.config.settings.configuredLayouts[0]
    );
  }

  get liveState() {
    return this.config.liveState;
  }

  get settings() {
    return this.config.settings;
  }

  /**
   * @param {LiveItems} liveItems
   * @param {boolean} broadcast if true, will broadcast to other clients
   */
  setLiveItems(liveItems, broadcast = true) {
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
  }

  toggleHideAll() {
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
  }

  /**
   * @param {Layout} layout
   * @param {boolean} broadcast if true, will broadcast to other clients
   */
  saveLayout(layout, broadcast = true) {
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
      this.setLiveItems(validLiveItems, broadcast);
    } else if (broadcast) {
      this.save();
    }

    if (broadcast) {
      this.publishLayout();
    }
  }

  /**
   * @param {Array<LiveButton>} favorites
   */
  saveFavorites(favorites) {
    this.config = iassign(
      this.config,
      config => config.settings,
      settings => {
        settings.favorites = favorites.slice();
        return settings;
      }
    );
    this.save();
  }

  /**
   * @param {number} alignment 0, 1, or 2
   */
  saveAlignment(alignment) {
    this.config = iassign(
      this.config,
      config => config.liveState,
      liveState => {
        liveState.componentAlignment = alignment;
        return liveState;
      }
    );
    this.save();
  }
}
