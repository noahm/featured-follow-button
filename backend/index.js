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
const datastore = config.google ? new Datastore({
  keyFilename: path.resolve(config.google.cloudPlatformKeyFile),
}) : null;
const entityKind = 'Channel';

// shape in google storage
// interface ChannelData {
//   liveButton: {
//     channelName: null | string;
//     displayName: null | string;
//   };
// }

function buildEntityForGoogle(channelID, liveButton) {
  return {
    key: datastore.key([entityKind, channelID]),
    data: {
      liveButton,
    },
  };
}

app.use(bodyParser.json());

app.use((req, res, next) => {
  // console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Extension-JWT');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

const initialState = {
  channelName: false,
  displayName: '',
};

// Record<channelID: string, ChannelData.liveButton>
const channelStates = {};

// Optionally restore state from google
if (datastore) {
  // query for all channels, add them to channelStates map
  let query = datastore.createQuery(entityKind);
  datastore.runQuery(query).then(results => {
    const channels = results[0];
    channels.forEach(channel => {
      channelStates[channel[datastore.KEY].name] = channel.liveButton;
    });
    console.log(`Restored state for ${channels.length} channels from google`);
  });
}

function getStateForChannel(channelID) {
  return channelStates[channelID] || initialState;
}

function setStateForChannel(channelID, newState) {
  channelStates[channelID] = newState;
  if (datastore) {
    datastore.save(buildEntityForGoogle(channelID, newState)).then(() => {
      console.log('Saved channel to google:', channelID);
    }).catch(err => {
      console.error('Google cloud error:', err);
    });
  }
}

function clearStateForChannel(channelID) {
  if (!channelStates[channelID]) {
    return;
  }
  delete channelStates[channelID];
  if (datastore) {
    datastore.delete(datastore.key([entityKind, channelID])).then(() => {
      console.log('Cleared entity from google:', channelID)
    }).catch(err => {
      console.error('Google cloud error:', err);
    });
  }
}

const extensionSecret = Buffer.from(config.twitch.extensionSecret, 'base64');
function broadcastStateForChannel(channelID) {
  const token = {
    exp: Date.now() + 1000,
    channel_id: channelID,
    role: 'external',
    pubsub_perms: {
      send: ['*'],
    },
    user_id: config.twitch.extensionOwnerID,
  };

  const channelState = getStateForChannel(channelID);

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
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      },
      timeout: 1000,
    }, (res) => {
      if (res.statusCode < 300) {
        if (!channelState.channelName) {
          clearStateForChannel(channelID);
        }
      }
      resolve();
    });
    req.on('error', (err) => {
      console.error('problem broadcasting state', { channelID, err });
      resolve();
    });
    req.write(body);
    req.end();
  });
}

app.post('/followButton/:channelID', (req, res) => {
  if (config.ssl) {
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


if (config.ssl) {
  const options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
  };
  https.createServer(options, app).listen(config.port, function () {
    console.log(`Extension backend service running on https`, config.port);
  });
} else {
  const http = require('http');
  http.createServer(app).listen(config.port, function() {
    console.log(`Extension backend service running on http`, config.port);
  });
}

// enable periodic state broadcast to all clients
function broadcastToAll() {
  console.time('broadcastToAll');
  Promise.all(
    Object.keys(channelStates).map((channelID) => broadcastStateForChannel(channelID))
  ).then(() => {
    console.timeEnd('broadcastToAll');
    setTimeout(broadcastToAll, 1000);
  });
}
setTimeout(broadcastToAll, 1000);
