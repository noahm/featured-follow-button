/**
 * Copy this file with the name `config.js` and fill in
 * the appripriate values to configure your app instance
 */

module.exports = {
  twitch: {
    clientID: 'XXX',
    extensionSecret: 'YYY',
    extensionOwnerID: '000',
  },

  /**
   * provide a path to a google cloud platform key for persistence
   * null out to disable GCP integration
   */
  google: {
    cloudPlatformKeyFile: './gcp-key.json',
  },

  /**
   * null out to disable ssl (for local testing)
   * also disables JWT verification for requests
   */
  ssl: {
    cert: '/etc/ssl/certs/myserver.crt',
    key: '/etc/ssl/certs/private/myserver.key',
  },
  port: 443,
};
