import { TWITCH_UNAVAILABLE, getUserInfo } from "./utils";

class AuthInstance {
  public clientID: string | undefined;
  public token: string | undefined;
  public helixToken: string | undefined;
  public userID: string | undefined;
  public userLogin: string | undefined;
  public isBroadcaster: boolean | undefined;
  public readonly authAvailable: Promise<void>;

  constructor() {
    this.authAvailable = new Promise<void>((resolve) => {
      if (TWITCH_UNAVAILABLE) {
        console.error("Twitch ext not present. Auth not available.");
        return;
      }

      Twitch.ext!.onAuthorized((auth) => {
        this.clientID = auth.clientId;
        this.userID = auth.userId;
        this.token = auth.token;
        this.helixToken = auth.helixToken;
        this.isBroadcaster =
          !!Twitch.ext!.viewer && Twitch.ext!.viewer.role === "broadcaster";

        resolve();
      });
    })
      .then(() => getUserInfo([], [this.userID!.substr(1)]))
      .then(([helixUser]) => {
        if (helixUser) {
          this.userLogin = helixUser.login;
        }
      });
  }
}

export const Auth = new AuthInstance();
