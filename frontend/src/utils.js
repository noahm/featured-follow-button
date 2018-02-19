export const backendHost = 'https://follow-btn.manneschmidt.net:4430';
// export const backendHost = 'http://localhost:4430';

export function getUsername(channelName, displayName) {
    if (!channelName) {
        return '';
    }
    if (!displayName) {
        return channelName;
    }
    return displayName + ' (' + channelName + ')';
}
