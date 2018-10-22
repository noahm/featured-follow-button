// @ts-check
import iassign from 'immutable-assign';
import '../../models';

const CONFIG_VERSION = '1.0';

/** @type {ChannelData} */
const defaultConfig = {
  liveButton: {},
  liveState: {
    liveItems: [],
  },
  settings: {
    favorites: [],
    configuredLayouts: [],
  },
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

  constructor() {
    if (typeof Twitch === 'undefined' || !Twitch.ext) {
      console.error('Twitch ext not present. Config not available.');
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
    });
  }

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
          ...JSON.parse(Twitch.ext.configuration.broadcaster.content),
        };
      }
    } finally {
      return ret;
    }
  }

  /**
   * @private
   */
  save() {
    Twitch.ext.configuration.set('broadcaster', CONFIG_VERSION, JSON.stringify(this.config));
  }

  get liveState() {
    return this.config.liveState;
  }

  get settings() {
    return this.config.settings;
  }

  /**
   * 
   * @param {LiveItems} liveItems
   */
  setLiveState(liveItems) {
    const newState = { liveItems };
    this.config = iassign(this.config, (config) => {
      config.liveState = newState;
      return config;
    });
    // set configuration
    this.save();
    // broadcast to pubsub
    Twitch.ext.send('broadcast', 'application/json', newState);
  }

  /**
   * 
   * @param {Layout} layout
   */
  saveLayout(layout) {
    this.config = iassign(this.config, (config) => config.settings, (settings) => {
      settings.configuredLayouts = [layout];
      return settings;
    });
    const availableSlots = new Set(this.config.settings.configuredLayouts[0].positions.map(item => item.id));
    const validLiveItems = this.config.liveState.liveItems.filter(item => availableSlots.has(item.id));
    // check if we deleted a slot with an active button
    if (validLiveItems.length < this.config.liveState.liveItems.length) {
      this.setLiveState(validLiveItems);
    } else {
      this.save();
    }
  }

  /**
   * @param {Array<LiveButton>} favorites
   */
  saveFavorites(favorites) {
    this.config = iassign(this.config, (config) => config.settings, (settings) => {
      settings.favorites = favorites.slice();
      return settings;
    });
    this.save();
  }
}
