import { parse } from "querystringify";
import { Layout } from "./models";

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

export const defaultLayout: Layout = {
  name: "default",
  positions: [{ type: "button", id: "00000000", top: 75, left: 75 }]
};
