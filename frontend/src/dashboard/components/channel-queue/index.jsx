import styles from './style';
import { Component } from 'react';
import { getUsername } from '../../../utils';
import { ChannelInput } from '../channel-input';

export class ChannelQueue extends Component {
  state = {
    favorites: [],
  };

  constructor(props) {
    super(props);
    this.props.config.configAvailable.then(() => {
      this.setState({
        favorites: this.props.config.settings.favorites,
      });
    });
  }

  render() {
    const { clientID } = this.props;
    const { favorites } = this.state;
    return (
      <div>
        <ChannelInput onAddFavorite={this.addFavoriteChannel} onActivate={this.props.onChange} clientID={clientID} />
        <div className={styles.channelList}>
          {!!favorites.length && <ol className={styles.favoritesList}>
            {favorites.map((favorite, i) => (
              <li className={styles.favoriteChannel} key={i}>
                {getUsername(favorite.channelName, favorite.displayName)}
                <div className={styles.favoriteItemActions} data-channel-index={i}>
                  <button onClick={this.onCueClick}>Activate</button>
                  <button onClick={this.onDeleteClick}>Delete</button>
                </div>
              </li>
            ))}
          </ol>}
        </div>
      </div>
    );
  }

  onCueClick = (e) => {
    const channelIndex = +e.currentTarget.parentElement.dataset.channelIndex;
    const channel = this.state.favorites[channelIndex];
    this.props.onChange(channel);
  }

  onDeleteClick = (e) => {
    const channelIndex = +e.currentTarget.parentElement.dataset.channelIndex;
    this.state.favorites.splice(channelIndex, 1);
    this.forceUpdate();
  }

  addFavoriteChannel = (channelName, displayName = '') => {
    this.state.favorites.push({ channelName, displayName });
    this.props.config.saveFavorites(this.state.favorites);
    this.forceUpdate();
  }
}
