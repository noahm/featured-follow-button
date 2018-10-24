// @ts-check
import { parse } from 'querystringify';

export function getUsername(channelName, displayName) {
    if (!channelName) {
        return '';
    }
    if (!displayName || displayName === channelName) {
        return channelName;
    }
    return displayName + ' (' + channelName + ')';
}

/**
 * @returns {string} hexadecimal representation of a random 32 bit value
 */
export function getRandomID() {
    const id = Math.floor(4294967296 * Math.random()).toString(16);
    if (id.length < 8) {
        return ('00000000' + id).slice(-8);
    }
    return id;
}

/**
 * @returns {'component' | 'video_overlay' | undefined}
 */
export function getAnchorMode() {
    return parse(window.location.search)['anchor'];
}

/** @type {Layout} */
export const defaultLayout = {
  positions: [{ type: 'button', id: '00000000', top: 75, left: 75 }],
};
