declare namespace Twitch {
  interface Actions {
    followChannel(channelName: string): void;
    minimize(): void;
    onFollow(cb: (didFollow: boolean, channelName: string) => void): void;
    requestIdShare(): void;
  }

  namespace Configuration {
    interface Root {
      broadcaster?: Segment;
      developer?: Segment;
      global?: Segment;
      onChanged(cb: () => void): void;
      set(segment: "broadcaster", version: string, content: string): void;
    }

    interface Segment {
      version?: string;
      content?: string;
    }
  }

  interface FeatureFlags {
    isChatEnabled: boolean;
    onChanged(cb: (changes: string[]) => void): void;
  }

  interface AuthCallback {
    /**
     * Channel ID of the page where the extension iframe is embedded.
     */
    channelId: string;
    /**
     * Client ID of the extension.
     */
    clientId: string;
    /**
     * JWT that should be passed to any EBS call for authentication.
     */
    token: string;
    /**
     * Opaque user ID.
     */
    userId: string;
  }

  type Role = "broadcaster" | "moderator" | "viewer" | "external";

  interface JwtToken {
    channel_id: string;
    exp: number;
    opaque_user_id: string;
    pubsub_perms: {
      listen: string[];
      send: string[];
    };
    role: Role;
    user_id?: string;
  }

  namespace Tracking {
    export enum InteractionTypes {
      Access,
      Content,
      Reward,
      Bits,
      Interact,
      Account,
      Configuration,
      StreamManager,
      Error,
      Other
    }

    export enum Categories {
      Click,
      Hover,
      Tap,
      Swipe,
      Impression,
      Other
    }

    export function trackEvent(
      name: string,
      interactionType: InteractionTypes,
      category: Categories
    ): void;
  }

  interface Context {
    arePlayerControlsVisible: boolean;
    bitrate: number;
    bufferSize: number;
    displayResolution: string;
    game: string;
    hlsLatencyBroadcaster: number;
    hostingInfo?: {
      hostedChannelId: number;
      hostingChannelId: number;
    };
    isFullScreen: boolean;
    isMuted: boolean;
    isPaused: boolean;
    isTheatreMode: boolean;
    language: string;
    mode: "viewer" | "dashboard" | "config";
    playbackMode: "video" | "audio" | "remote" | "chat-only";
    theme: "light" | "dark";
    videoResolution: string;
    volume: number;
  }

  interface Viewer {
    opaqueId: string;
    id: string | null;
    role: Role;
    isLinked: boolean;
    sessionToken: string;
    subscriptionStatus: null | {
      tier: "1000" | "2000" | "3000";
    };
    onChanged(cb: () => void): void;
  }

  type PubsubCallback = (
    target: string,
    contentType: string,
    message: string
  ) => void;

  interface ExtensionsJsHelper {
    version: string;
    environment: string;
    actions: Actions;
    configuration: Configuration.Root;
    viewer: Viewer | null;
    tracking: typeof Tracking;
    onAuthorized(cb: (auth: AuthCallback) => void): void;
    onContext(
      cb: (context: Context, updatedProperties: Array<keyof Context>) => void
    ): void;
    onError(cb: (err: Error) => void): void;
    onHighlightChanged(cb: (isHighlighted: boolean) => void): void;
    onPositionChanged(cb: (position: { x: number; y: number }) => void): void;
    onVisibilityChaged(
      cb: (isVisible: boolean, context?: Context) => void
    ): void;
    send(target: string, contentType: string, message: string | {}): void;
    listen(target: String, cb: PubsubCallback): void;
    unlisten(target: String, cb: PubsubCallback): void;
    rig: {
      log(message: string): void;
    };
  }

  export const ext: ExtensionsJsHelper | undefined;
}
