"use strict";

const config = require('./config');

const Datastore = require('@google-cloud/datastore');
const https = require('https');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const datastore = fs.existsSync('gcp-key.json') ? new Datastore({
  keyFilename: path.resolve('gcp-key.json'),
}) : new Datastore();

const entityKind = 'Channel';


let success = 0;
let failed = 0;
datastore.runQuery(datastore.createQuery(entityKind)).then(async ([channels]) => {
  for (const channel of channels) {
    if (!channel.liveButton || !channel.liveButton.channelName) {
      console.log('skipping empty data for ', channel[datastore.KEY].name);
    }
    const configuration = {
      liveState: {
        hideAll: false,
        liveItems: [
          {
            type: 'button', id: '00000000', top: 75, left: 75,
            channelName: channel.liveButton.channelName,
            displayName: channel.liveButton.displayName,
          },
        ],
      },
      settings: {
        favorites: [],
        configuredLayouts: [],
      },
    };
    console.log(channel[datastore.KEY].name, channel.liveButton);
    await saveConfiguration(channel[datastore.KEY].name, configuration).then(() => {
      success += 1;
    }).catch(() => {
      failed += 1;
      console.error('channel failed to set config', channel[datastore.KEY].name);
    });
  }
}).then(() => {
  console.log(`${success} saved, ${failed} failed (${success + failed} total)`);
});

const extensionSecret = Buffer.from(config.twitch.extensionSecret, 'base64');
function saveConfiguration(channelID, channelConfiguration) {
  const token = {
    exp: Date.now() + 1000,
    channel_id: channelID,
    role: 'external',
    user_id: config.twitch.extensionOwnerID,
  };

  const body = JSON.stringify({
    channel_id: channelID,
    segment: 'broadcaster',
    version: '1.0',
    content: JSON.stringify(channelConfiguration),
  });
  const signedToken = jwt.sign(token, extensionSecret);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.twitch.tv',
      path: '/extensions/' + config.twitch.clientID + '/configurations',
      method: 'PUT',
      headers: {
        'Client-Id': config.twitch.clientID,
        'Authorization': 'Bearer ' + signedToken,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body, 'utf8'),
      },
      timeout: 1000,
    }, (response) => {
      if (response.statusCode >= 300) {
        console.error('Bad status code from twitch:', response.statusMessage);
        reject();
      }
      resolve();
    });
    req.on('error', (err) => {
      console.error('problem broadcasting state', { channelID, err });
      reject();
    });
    req.write(body, 'utf8');
    req.end();
  });
}
