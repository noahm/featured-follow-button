export function getUsername(channelName, displayName) {
    if (!channelName) {
        return '';
    }
    if (!displayName) {
        return channelName;
    }
    return displayName + ' (' + channelName + ')';
}
