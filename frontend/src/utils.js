export const twitchClientID = 'ih4ptg04wzw6nf4qms0612b8uj0tbh';
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
