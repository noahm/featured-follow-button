import { FC, useContext } from "react";
import { FollowButton } from "./follow-button";
import styles from "./follow-list.css";
import { ConfigContext } from "../config";
import { Auth } from "../auth";
import { ChannelInput } from "../dashboard/components/channel-input";

interface Props {
  disabled?: boolean;
  onFollowClick?: () => void;
}

export const FollowList: FC<Props> = props => {
  const { config, addQuickButton, setLiveItems } = useContext(ConfigContext);
  const isBroadcaster = Auth.isBroadcaster;
  const { liveItems: items, componentHeader: title } = config.liveState;

  return (
    <div className={styles.followList}>
      {title && <h3>{title}</h3>}
      <ul>
        {items.map(item => {
          return (
            <li key={item.id}>
              <FollowButton
                followChannel={item.channelName}
                onClick={props.onFollowClick}
                disabled={props.disabled}
              />{" "}
              Follow {item.displayName || item.channelName}
              {isBroadcaster && (
                <button
                  onClick={() =>
                    setLiveItems(items.filter(i => i.id !== item.id))
                  }
                >
                  Delete
                </button>
              )}
            </li>
          );
        })}
        {isBroadcaster && (
          <li className={styles.addItem}>
            <ChannelInput submitText="Add" onActivate={addQuickButton} />
          </li>
        )}
      </ul>
    </div>
  );
};
