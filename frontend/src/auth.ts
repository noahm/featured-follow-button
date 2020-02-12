import { TWITCH_UNAVAILABLE } from "./utils";

class AuthInstance {
  public clientID: string | undefined;
  public token: string | undefined;
  public userID: string | undefined;
  public isBroadcaster: boolean | undefined;
  public readonly authAvailable: Promise<void>;

  constructor() {
    this.authAvailable = new Promise(resolve => {
      if (TWITCH_UNAVAILABLE) {
        console.error("Twitch ext not present. Auth not available.");
        return;
      }

      Twitch.ext!.onAuthorized(auth => {
        this.clientID = auth.clientId;
        this.userID = auth.userId;
        this.token = auth.token;
        this.isBroadcaster =
          !!Twitch.ext!.viewer && Twitch.ext!.viewer.role === "broadcaster";

        resolve();
      });
    });
  }
}

export const Auth = new AuthInstance();
