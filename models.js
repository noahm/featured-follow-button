
/** @typedef {{ channelName?: string, displayName?: string }} LiveButton info for a live follow item */

/**
 * @typedef {object} PositionedButton
 * @property {'button'} type
 * @property {string} id
 * @property {number=} top - percentage from edge, 0 - 100
 * @property {number=} left - percentage from edge, 0 - 100
 */

/**
 * @typedef {object} PositionedZone
 * @property {'zone'} type
 * @property {string} id
 * @property {number=} top - percentage from edge, 0 - 100
 * @property {number=} left - percentage from edge, 0 - 100
 * @property {number=} height - percentage of player height, 0 - 100
 * @property {number=} width - percentage of player width, 0 - 100
 */

/** @typedef {PositionedButton | PositionedZone} LayoutItem */
/** @typedef {LayoutItem & LiveButton} LiveLayoutItem */
/** @typedef {Array<LiveLayoutItem>} LiveItems */

/**
 * @typedef Layout
 * @property {Array<LayoutItem>} positions
 * @property {string=} name
 */

/**
 * @typedef {object} LiveState
 * @property {LiveItems} liveItems
 * @property {boolean} hideAll
 */

/**
 * @typedef {object} Settings
 * @property {Array<LiveButton>} favorites
 * @property {Array<Layout>} configuredLayouts
 */

/**
 * shape in twitch configuration
 * @typedef {object} ChannelData
 * @property {LiveState} liveState Modern live data
 * @property {Settings} settings
 */
