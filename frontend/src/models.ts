/**
 * info for a live follow item
 */
export interface LiveButton {
  channelName: string;
  displayName?: string;
}

export interface PositionedButton {
  type: "button";
  id: string;
  /**
   * Percentage from edge, 0 - 100
   */
  top: number;
  /**
   * percentage from edge, 0 - 100
   */
  left: number;
}

export interface PositionedZone {
  type: "zone";
  id: string;
  /**
   * percentage from edge, 0 - 100
   */
  top: number;
  /**
   * percentage from edge, 0 - 100
   */
  left: number;
  /**
   * percentage of player height, 0 - 100
   */
  height: number;
  /**
   * percentage of player height, 0 - 100
   */
  width: number;
}

export interface QuickButton {
  type: "quick";
  id: string;
}

export type LayoutItem = PositionedButton | PositionedZone | QuickButton;
export type LiveLayoutItem = LayoutItem & LiveButton;
export type LiveItems = Array<LiveLayoutItem>;

export interface Layout {
  positions: Array<LayoutItem>;
  name: string;
}

export interface LiveState {
  liveItems: LiveItems;
  hideAll: boolean;
  /**
   * Message displayed at the top of the follow list in component mode
   */
  componentHeader: string;
}

export interface Settings {
  favorites: Array<LiveButton>;
  configuredLayouts: Array<Layout>;
}

/**
 * shape of object saved in twitch configuration
 */
export interface ChannelData {
  liveState: LiveState;
  settings: Settings;
}
