import "regenerator-runtime/runtime";
import { parse, stringify } from "querystringify";
import { Layout, UserStyles } from "./models";
import { Auth } from "./auth";

/**
 * True if twtich ext library is unavailable
 */
export const TWITCH_UNAVAILABLE = typeof Twitch === "undefined" || !Twitch.ext;

export function getUsername(
  channelName: string | undefined,
  displayName: string | undefined
) {
  if (!channelName) {
    return "";
  }
  if (!displayName || displayName === channelName) {
    return channelName;
  }
  return displayName + " (" + channelName + ")";
}

/**
 * @returns {string} hexadecimal representation of a random 32 bit value
 */
export function getRandomID() {
  const id = Math.floor(4294967296 * Math.random()).toString(16);
  if (id.length < 8) {
    return ("00000000" + id).slice(-8);
  }
  return id;
}

/**
 * Clamp a value between a lower-bound and upper-bound
 */
export function clamp(lb: number, n: number, ub: number) {
  return Math.min(Math.max(lb, n), ub);
}

interface Position {
  top: number;
  left: number;
  height: number;
  width: number;
}

export function getZoneStyles(position: Position, styles: UserStyles) {
  const {
    zoneBorderColor,
    zoneBorderRadius,
    zoneBorderWidth,
    zoneBorderStyle,
    zoneTextWeight,
    zoneTextSize,
    zoneShadowColor,
    zoneShadowStrength,
    zoneTextAlign,
    zoneTextColor,
    zoneBorderVisible,
  } = styles;
  const style: Record<string, string | undefined> = {
    top: position.top + "%",
    left: position.left + "%",
    height: position.height + "%",
    width: position.width + "%",
    borderRadius: zoneBorderRadius || undefined,
    borderWidth: `${zoneBorderWidth}px`,
    borderStyle: zoneBorderStyle,
    fontWeight: zoneTextWeight,
    fontSize: zoneTextSize / 100 + "em",
    color: zoneTextColor,
    "--border-color": zoneBorderColor,
    "--shadow-color": zoneShadowColor,
    "--shadow-strength": `${zoneShadowStrength}px`,
  };
  if (zoneBorderVisible === "never") {
    style.borderColor = "transparent";
  }
  if (zoneTextAlign !== "C") {
    if (zoneTextAlign.match(/N/)) {
      style.alignItems = "flex-start";
    } else if (zoneTextAlign.match(/S/)) {
      style.alignItems = "flex-end";
    }
    if (zoneTextAlign.match(/W/)) {
      style.textAlign = "left";
      style.justifyContent = "flex-start";
    } else if (zoneTextAlign.match(/E/)) {
      style.textAlign = "right";
      style.justifyContent = "flex-end";
    }
  }
  return style;
}

export function getAnchorMode():
  | "component"
  | "video_overlay"
  | "panel"
  | "mobile"
  | undefined {
  const queryString = parse(window.location.search) as Record<string, string>;
  if ("force_anchor" in queryString) {
    return queryString.force_anchor as ReturnType<typeof getAnchorMode>;
  }
  if ("anchor" in queryString) {
    return queryString.anchor as ReturnType<typeof getAnchorMode>;
  }
}

export function getIsPopout() {
  const queryString = parse(window.location.search) as Record<string, string>;
  return !!queryString.popout;
}

export const defaultLayout: Layout = {
  name: "default",
  positions: [
    { type: "button", id: "00000000", top: 75, left: 75, align: "right" },
  ],
};

export interface HelixUser {
  broadcaster_type: "partner" | "affiliate" | "";
  description: string;
  display_name: string;
  id: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: "staff" | "admin" | "global_mod" | "";
  view_count: number;
}

const userCache: Record<string, false | HelixUser> = {};

/**
 *
 * @param logins
 * @param assumeFalse when true, assume any cache miss is a missing user
 */
function getUsersFromCache(logins: string[], assumeFalse = false) {
  return logins.map((login) => {
    if (userCache.hasOwnProperty(login)) {
      return userCache[login];
    } else {
      if (assumeFalse) {
        userCache[login] = false;
        return false;
      }
      throw new Error("user missing from cache");
    }
  });
}

export async function getUserInfo(
  logins: string[],
  ids: string[] = []
): Promise<Array<false | HelixUser>> {
  if (!logins.length && !ids.length) {
    return [];
  }

  try {
    return getUsersFromCache(logins.concat(...ids));
  } catch {
    // no worries
  }

  let params = "";
  for (const login of logins) {
    params += stringify({ login }, params ? "&" : false);
  }
  for (const id of ids) {
    params += stringify({ id }, params ? "&" : false);
  }

  try {
    await Auth.authAvailable;
    const response: { data: Array<HelixUser> } = await fetch(
      "https://api.twitch.tv/helix/users?" + params,
      {
        headers: {
          "Client-ID": Auth.clientID || "ih4ptg04wzw6nf4qms0612b8uj0tbh",
          Authorization: `Extension ${Auth.helixToken}`,
        },
      }
    ).then((r) => r.json());

    if (response.data) {
      // got data back
      for (const user of response.data) {
        userCache[user.login] = user;
        userCache[user.id] = user;
      }
      // assume all unavailable users from input are not real users
      return getUsersFromCache(logins.concat(...ids), true);
    } else {
      // request error of some kind
      return [];
    }
  } catch {
    return [];
  }
}

/**
 * Returns a function that will pass calls on to `input` exactly
 * `delay`ms later. Multiple invocations within the delay period
 * will reset the delay period.
 */
export function debounce<T extends Function>(input: T, delay: number): T {
  let timeout = 0;
  return ((...args: unknown[]) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      window.clearTimeout(timeout);
      return input(...args);
    }, delay);
  }) as any;
}
