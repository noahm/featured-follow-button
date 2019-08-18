import { Component } from "react";
import { LiveLayoutItem } from "../models";
import { FollowButton } from "./follow-button";
import styles from "./follow-list.css";

interface Props {
  title: string;
  items: LiveLayoutItem[];
  disabled?: boolean;
  onFollowClick?: () => void;
}

export class FollowList extends Component<Props> {
  public render() {
    return (
      <div className={styles.followList}>
        {this.props.title && <h3>{this.props.title}</h3>}
        <ul>
          {this.props.items.map(item => {
            return (
              <li key={item.id}>
                <FollowButton
                  followChannel={item.channelName}
                  onClick={this.props.onFollowClick}
                />{" "}
                Follow {item.displayName || item.channelName}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
