"use strict";

const config = require('./config');

const Datastore = require('@google-cloud/datastore');
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const datastore = fs.existsSync('gcp-key.json') ? new Datastore({
  keyFilename: path.resolve('gcp-key.json'),
}) : new Datastore();

// shape in google storage
// interface ChannelData {
//   liveButton: {
//     channelName: null | string;
//     displayName: null | string;
//   };
// }

const entityKind = 'Channel';
function keyForChannel(channelID) {
  return datastore.key([entityKind, channelID]);
}

function buildEntityForGoogle(channelID, liveButton) {
  return {
    key: keyForChannel(channelID),
    data: {
      liveButton,
    },
  };
}

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Extension-JWT');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

const initialState = {
  channelName: false,
  displayName: '',
};

/**
 * @param {string} channelID
 * @return {{ channelName: null | string; displayName: null | string } | null}
 */
async function getStateForChannel(channelID) {
  try {
    const results = await datastore.get(keyForChannel(channelID));
    if (results && results[0]) {
      return results[0].liveButton;
    } else {
      return initialState;
    }
  } catch (err) {
    console.warn('Exception during channel state lookup', {
      channelID,
      err,
    });
  }
  return null;
}

function setStateForChannel(channelID, newState) {
  if (!newState || !newState.channelName) {
    clearStateForChannel(channelID);
  } else {
    datastore.save(buildEntityForGoogle(channelID, newState)).then(() => {
      console.log('Saved channel to google:', channelID);
    }).catch(err => {
      console.error('Google cloud error:', err);
    });
  }
  broadcastStateForChannel(channelID, newState);
}

function clearStateForChannel(channelID) {
  if (datastore) {
    datastore.delete(keyForChannel(channelID)).then(() => {
      console.log('Cleared entity from google:', channelID)
    }).catch(err => {
      console.error('Google cloud error:', err);
    });
  }
}

const extensionSecret = Buffer.from(config.twitch.extensionSecret, 'base64');
function broadcastStateForChannel(channelID, channelState) {
  const token = {
    exp: Date.now() + 1000,
    channel_id: channelID,
    role: 'external',
    pubsub_perms: {
      send: ['*'],
    },
    user_id: config.twitch.extensionOwnerID,
  };

  const body = JSON.stringify({
    content_type: 'application/json',
    message: JSON.stringify(channelState),
    targets: ['broadcast'],
  });
  const signedToken = jwt.sign(token, extensionSecret);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.twitch.tv',
      path: '/extensions/message/' + channelID,
      method: 'POST',
      headers: {
        'Client-Id': config.twitch.clientID,
        'Authorization': 'Bearer ' + signedToken,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body, 'utf8'),
      },
      timeout: 1000,
    }, resolve);
    req.on('error', (err) => {
      console.error('problem broadcasting state', { channelID, err });
      resolve();
    });
    req.write(body, 'utf8');
    req.end();
  });
}

app.post('/state/:channelID', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const token = jwt.verify(req.header('x-extension-jwt'), new Buffer(config.twitch.extensionSecret, 'base64'));
      if (!token || token.role !== 'broadcaster' || token.channel_id !== req.params.channelID) {
        console.log('Deny request from unauthorized role', { channel_id: req.params.channelID, token });
        res.status(403).end();
        return;
      }
    } catch (e) {
      console.log('could not verify jwt token');
      res.status(400).end();
      return;
    }
  }

  // TODO add validation to fields available in `req.body` and return 400 if appropriate

  res.status(200).end();
  setStateForChannel(req.params.channelID, req.body);
});

app.get('/state/:channelID', async (req, res) => {
  const state = await getStateForChannel(req.params.channelID);
  res.setHeader('Pragma', 'Public');
  res.setHeader('Cache-Control', 'public, max-age=90');
  res.status(200).send(state || {});
  res.end();
});

app.get('/', (req, res) => {
  res.status(200).send('Go away').end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Extension backend service running on`, PORT);
});
