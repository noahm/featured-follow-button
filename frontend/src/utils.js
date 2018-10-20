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
