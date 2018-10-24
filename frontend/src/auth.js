// @ts-check

class AuthInstance {
  /**
   * @type {string}
   */
  clientID;
  /**
   * @type {string}
   */
  token;
  /**
   * @type {string}
   */
  userID;

  
  /**
   * @readonly
   * @type {Promise<void>}
   */
  authAvailable;

  constructor() {
    if (typeof Twitch === 'undefined' || !Twitch.ext) {
      console.error('Twitch ext not present. Auth not available.');
      return;
    }

    this.authAvailable = new Promise(resolve => {
      Twitch.ext.onAuthorized(auth => {
        this.clientID = auth.clientId;
        this.userID = auth.userId;
        this.token = auth.token;

        resolve();
      });
    });
  }
}

export const Auth = new AuthInstance();
