declare namespace Twitch {
  interface Actions {
    followChannel(channelName: string);
    minimize(): void;
    onFollow(cb: (didFollow: boolean, channelName: string) => void);
    requestIdShare(): void;
  }

  namespace Configuration {
    interface Root {
      broadcaster?: Segment;
      developer?: Segment;
      global?: Segment;
      onChanged(cb: () => void);
      set(segment: 'broadcaster', version: string, content: string): void;
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
    channelId: string; // Channel ID of the page where the extension is iframe embedded.
    clientId: string; // Client ID of the extension.
    token: string; // JWT that should be passed to any EBS call for authentication.
    userId: string; // Opaque user ID.
  }

  interface JwtToken {
    channel_id: string;
    exp: number;
    opaque_user_id: string;
    pubsub_perms: {
      listen: string[];
      send: string[];
    };
    role: 'broadcaster' | 'moderator' | 'viewer' | 'external';
    user_id?: string;
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
    mode: 'viewer' | 'dashboard' | 'config';
    playbackMode: 'video' | 'audio' | 'remote' | 'chat-only';
    theme: 'light' | 'dark';
    videoResolution: string;
    volume: number;
  }

  type PubsubCallback = (target: string, contentType: string, message: string) => void;

  interface ExtensionsJsHelper {
    version: string;
    environment: string;
    actions: Actions;
    configuration: Configuration.Root;
    onAuthorized(cb: (auth: AuthCallback) => void);
    onContext(cb: (context: Context) => void);
    onError(cb: (err: Error) => void);
    onHighlightChanged(cb: (isHighlighted: boolean) => void);
    onPositionChanged(cb: (position: { x: number, y: number }) => void);
    onVisibilityChaged(cb: (isVisible: boolean, context?: Context) => void);
    send(target: string, contentType: string, message: string | {});
    listen(target: String, cb: PubsubCallback);
    unlisten(target: String, cb: PubsubCallback);
  }

  export const ext: ExtensionsJsHelper | undefined;
}
