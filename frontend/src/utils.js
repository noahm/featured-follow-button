export const backendHost = 'https://lively-nimbus-195718.appspot.com';
// export const backendHost = 'http://localhost:8080';

export function getUsername(channelName, displayName) {
    if (!channelName) {
        return '';
    }
    if (!displayName) {
        return channelName;
    }
    return displayName + ' (' + channelName + ')';
}

export function getInitialState(channelID) {
    return fetch(backendHost + '/state/' + encodeURIComponent(channelID)).then(r => r.json());
}

export function getRandomID() {
    return Math.floor(100000 * Math.random());
}
