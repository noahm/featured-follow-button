import { FC, useContext } from "react";
import { FollowButton } from "./follow-button";
import styles from "./follow-list.css";
import { ConfigContext } from "../config";

interface Props {
  disabled?: boolean;
  onFollowClick?: () => void;
  isBroadcaster?: boolean;
}

export const FollowList: FC<Props> = props => {
  const config = useContext(ConfigContext);
  const { isBroadcaster, onFollowClick } = props;
  const { liveItems: items, componentHeader: title } = config.config.liveState;
  return (
    <div className={styles.followList}>
      {title && <h3>{title}</h3>}
      <ul>
        {items.map(item => {
          return (
            <li key={item.id}>
              <FollowButton
                followChannel={item.channelName}
                onClick={onFollowClick}
              />{" "}
              Follow {item.displayName || item.channelName}
              {isBroadcaster && <button>Delete</button>}
            </li>
          );
        })}
        {isBroadcaster && (
          <li>
            <input type="text" placeholder="Channel Username" />
            <button>Add</button>
          </li>
        )}
      </ul>
    </div>
  );
};
