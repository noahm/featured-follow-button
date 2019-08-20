import styles from "./style.css";
import { Component, MouseEvent } from "react";
import { getUsername } from "../../../utils";
import { ChannelInput } from "../channel-input";
import { LiveButton } from "../../../models";
import { ConfigState } from "../../../config";

interface Props {
  config: ConfigState;
  onChange: (item: LiveButton) => void;
}

export class ChannelQueue extends Component<Props> {
  render() {
    const { favorites } = this.props.config.config.settings;
    return (
      <div>
        <ChannelInput
          submitText="Activate"
          onAddFavorite={this.addFavoriteChannel}
          onActivate={this.props.onChange}
        />
        <div className={styles.channelList}>
          {!!favorites.length && (
            <ol className={styles.favoritesList}>
              {favorites.map((favorite, i) => (
                <li className={styles.favoriteChannel} key={i}>
                  {getUsername(favorite.channelName, favorite.displayName)}
                  <div
                    className={styles.favoriteItemActions}
                    data-channel-index={i}
                  >
                    <button onClick={this.onActivateClick}>Activate</button>
                    <button onClick={this.onDeleteClick}>Delete</button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    );
  }

  onActivateClick = (e: MouseEvent<HTMLButtonElement>) => {
    const channelIndex = +e.currentTarget.parentElement!.dataset.channelIndex!;
    const channel = this.props.config.config.settings.favorites[channelIndex];
    this.props.onChange(channel);
  };

  onDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    const channelIndex = +e.currentTarget.parentElement!.dataset.channelIndex!;
    const newFavorites = this.props.config.config.settings.favorites.slice();
    newFavorites.splice(channelIndex, 1);
  };

  addFavoriteChannel = (channelName: string, displayName = "") => {
    const newFavorites = this.props.config.config.settings.favorites.slice();
    newFavorites.push({ channelName, displayName });
    this.props.config.saveFavorites(newFavorites);
  };
}
