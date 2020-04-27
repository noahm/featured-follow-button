import { CSSProperties } from "react";
import { FollowButton } from "./follow-button";
import { FollowZone } from "./follow-zone";
import { LiveLayoutItem, LiveState } from "../models";
import styles from "./overlay.css";

interface Props {
  isBroadcaster: boolean;
  liveState: LiveState;
}

export function OverlayView({ isBroadcaster, liveState }: Props) {
  return (
    <main
      className={styles.overlay}
      style={{ fontFamily: liveState.styles.fontFamily }}
    >
      {liveState.liveItems.map((item?: LiveLayoutItem) => {
        const itemsHidden = liveState.hideAll && !isBroadcaster;

        if (itemsHidden || !item || !item.channelName) {
          return null;
        }

        if (item.type === "button") {
          const style: CSSProperties = {
            top: `${item.top}%`,
            position: "absolute",
          };
          if (item.align === "left") {
            style.left = `${item.left}%`;
          } else {
            style.right = `${100 - item.left}%`;
          }
          return (
            <div style={style} key={item.id + ":" + item.channelName}>
              <FollowButton
                channelLogin={item.channelName}
                channelDisplayName={item.displayName}
              />
            </div>
          );
        } else if (item.type === "zone") {
          return <FollowZone key={item.id} item={item} />;
        }
      })}
    </main>
  );
}
