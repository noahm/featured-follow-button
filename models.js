
/** @typedef {{ channelName?: string, displayName?: string }} LiveButton */

/**
 * @typedef {object} PositionedButton
 * @property {'button'} type
 * @property {number=} top - percentage from edge, 0 - 100
 * @property {number=} left - percentage from edge, 0 - 100
 */

/**
 * @exports
 * @typedef {object} PositionedZone
 * @property {'zone'} type
 * @property {number=} top - percentage from edge, 0 - 100
 * @property {number=} left - percentage from edge, 0 - 100
 * @property {number=} height - percentage of player height, 0 - 100
 * @property {number=} width - percentage of player width, 0 - 100
 */

/** @typedef {(PositionedButton | PositionedZone)} LayoutItem */
/** @typedef {(PositionedButton | PositionedZone) & { channelName?: string; displayName?: string }} LiveLayoutItem */
/** @typedef {Array<LiveLayoutItem>} LiveItems */

/**
 * @typedef Layout
 * @property {Array<LayoutItem>} positions
 * @property {string=} name
 */

/**
 * @typedef {object} LiveState
 * @property {LiveItems=} liveItems
 * @property {string=} channelName
 * @property {string=} displayName
 */

/**
* @typedef {object} Settings
* @property {Array<LiveButton>} queue
* @property {Array<Layout>} configuredLayouts
*/

/**
 * shape in twitch configuration
 * @typedef {object} ChannelData
 * @property {LiveButton} liveButton Legacy live data
 * @property {LiveState} liveState Modern live data
 * @property {Settings} settings
 */
