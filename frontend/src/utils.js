import { parse } from 'querystringify';

export function getUsername(channelName, displayName) {
    if (!channelName) {
        return '';
    }
    if (!displayName) {
        return channelName;
    }
    return displayName + ' (' + channelName + ')';
}

export function getRandomID() {
    return Math.floor(100000 * Math.random());
}

/**
 * @returns {'component' | 'video_overlay' | undefined}
 */
export function getAnchorMode() {
    return parse(window.location.search).anchor;
}
