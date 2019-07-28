import styles from './style.css';
import { Component, MouseEvent } from 'react';
import { getUsername } from '../../../utils';
import { ChannelInput } from '../channel-input';
import { LiveButton } from '../../../models';
import { Config } from '../../../config';

interface Props {
  config: Config;
  onChange: (item: LiveButton) => void;
}

interface State {
  favorites: Array<LiveButton>;
}

export class ChannelQueue extends Component<Props, State> {
  state: State = {
    favorites: [],
  };

  constructor(props: Props) {
    super(props);
    this.props.config.configAvailable.then(() => {
      this.setState({
        favorites: this.props.config.settings.favorites,
      });
    });
  }

  render() {
    const { favorites } = this.state;
    return (
      <div>
        <ChannelInput onAddFavorite={this.addFavoriteChannel} onActivate={this.props.onChange} />
        <div className={styles.channelList}>
          {!!favorites.length && <ol className={styles.favoritesList}>
            {favorites.map((favorite, i) => (
              <li className={styles.favoriteChannel} key={i}>
                {getUsername(favorite.channelName, favorite.displayName)}
                <div className={styles.favoriteItemActions} data-channel-index={i}>
                  <button onClick={this.onActivateClick}>Activate</button>
                  <button onClick={this.onDeleteClick}>Delete</button>
                </div>
              </li>
            ))}
          </ol>}
        </div>
      </div>
    );
  }

  onActivateClick = (e: MouseEvent<HTMLButtonElement>) => {
    const channelIndex = +e.currentTarget.parentElement!.dataset.channelIndex!;
    const channel = this.state.favorites[channelIndex];
    this.props.onChange(channel);
  }

  onDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    const channelIndex = +e.currentTarget.parentElement!.dataset.channelIndex!;
    const newFavorites = this.state.favorites.slice();
    newFavorites.splice(channelIndex, 1);
    this.setState({
      favorites: newFavorites,
    });
  }

  addFavoriteChannel = (channelName: string, displayName = '') => {
    const newFavorites = this.state.favorites.slice();
    newFavorites.push({ channelName, displayName });
    this.props.config.saveFavorites(newFavorites);
    this.setState({
      favorites: newFavorites,
    });
  }
}
