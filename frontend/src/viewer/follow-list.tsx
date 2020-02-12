import { FC, useContext, useEffect, useState } from "react";
import { FollowButton } from "./follow-button";
import styles from "./follow-list.css";
import { ConfigContext } from "../config";
import { Auth } from "../auth";
import { ChannelInput } from "../config/live-config/channel-input";
import { getUserInfo, HelixUser } from "../utils";

interface Props {
  disabled?: boolean;
  onFollowClick?: () => void;
}

export const FollowList: FC<Props> = props => {
  const [userInfo, setUserInfo] = useState<Record<string, HelixUser>>({});
  const { config, addQuickButton, setLiveItems } = useContext(ConfigContext);
  const channelNames = new Set(
    config.liveState.liveItems.map(item => item.channelName)
  );
  useEffect(() => {
    if (!config.liveState.liveItems.length) {
      return;
    }
    getUserInfo(...channelNames).then(info => {
      const userInfo: Record<string, HelixUser> = {};
      for (const channel of info) {
        if (channel) {
          userInfo[channel.login] = channel;
        }
      }
      setUserInfo(userInfo);
    });
  }, [Array.from(channelNames).join(":")]);
  const isBroadcaster = Auth.isBroadcaster;
  const { liveItems: items, listOptions } = config.liveState;

  return (
    <div className={styles.followList}>
      {listOptions.title && <h3>{listOptions.title}</h3>}
      <ul>
        {items.map(item => {
          return (
            <li key={item.id}>
              <FollowButton
                followChannel={item.channelName}
                onClick={props.onFollowClick}
                disabled={props.disabled}
              />{" "}
              {listOptions.showAvatars && (
                <img
                  src={userInfo[item.channelName]?.profile_image_url}
                  className={styles.avatar}
                />
              )}
              {item.displayName || item.channelName}
              {isBroadcaster && (
                <button
                  onClick={() =>
                    setLiveItems(items.filter(i => i.id !== item.id))
                  }
                >
                  x
                </button>
              )}
              {listOptions.showDescriptions && userInfo[item.channelName] && (
                <caption>{userInfo[item.channelName].description}</caption>
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
