import "regenerator-runtime/runtime";
import { parse, stringify } from "querystringify";
import { Layout } from "./models";
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
  positions: [{ type: "button", id: "00000000", top: 75, left: 75 }]
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
  return logins.map(login => {
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
  ...logins: string[]
): Promise<Array<false | HelixUser>> {
  if (!logins.length) {
    return [];
  }

  try {
    return getUsersFromCache(logins);
  } catch {
    // no worries
  }

  let params = "";
  for (const login of logins) {
    params += stringify({ login }, params ? "&" : false);
  }

  try {
    const response: { data: Array<HelixUser> } = await fetch(
      "https://api.twitch.tv/helix/users?" + params,
      {
        headers: {
          "Client-ID": Auth.clientID || "ih4ptg04wzw6nf4qms0612b8uj0tbh"
        }
      }
    ).then(r => r.json());

    if (response.data) {
      // got data back
      for (const user of response.data) {
        userCache[user.login] = user;
      }
      // assume all unavailable users from input are not real users
      return getUsersFromCache(logins, true);
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
