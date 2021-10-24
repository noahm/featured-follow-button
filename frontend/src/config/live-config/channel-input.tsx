import styles from "./channel-input.css";
import {
  Component,
  createRef,
  FormEvent,
  ChangeEvent,
  useContext
} from "react";
import { LiveButton } from "../../models";
import { ConfigContext } from "../../config";
import { getUserInfo } from "../../utils";

const LOGIN_REGEX = /^[a-zA-Z0-9]\w{0,23}$/;
const remoteCheckCache: Record<string, boolean> = {};

interface Props {
  submitText: string;
  onAddFavorite?: (channelName: string, displayName: string) => void;
  onActivate: (item: LiveButton) => void;
}

interface ContextProps {
  favorites: LiveButton[];
}

interface State {
  pendingChannelName: string;
  pendingDisplayName: string;
  isValidating: boolean;
  useRemoteDisplayName: boolean;
}

class ChannelInputImpl extends Component<Props & ContextProps, State> {
  state: State = {
    pendingChannelName: "",
    pendingDisplayName: "",
    isValidating: false,
    useRemoteDisplayName: true
  };
  channelInput = createRef<HTMLInputElement>();

  componentDidUpdate() {
    if (!this.isValid(this.state.pendingChannelName)) {
      this.channelInput.current!.setCustomValidity(
        "No spaces or special characters"
      );
    } else if (this.isKnownBad(this.state.pendingChannelName)) {
      this.channelInput.current!.setCustomValidity("Not a twitch channel");
    } else {
      this.channelInput.current!.setCustomValidity("");
    }
  }

  render() {
    const {
      isValidating,
      pendingChannelName,
      useRemoteDisplayName
    } = this.state;
    const { favorites } = this.props;
    return (
      <form onSubmit={this.onSubmit}>
        <input
          list="favorites"
          width="15"
          placeholder="Channel Username"
          ref={this.channelInput}
          value={pendingChannelName}
          onChange={this.setChannelName}
        />
        <span className={styles.error}> {this.renderError()}</span>
        <br />
        <input
          width="15"
          placeholder="Display Name (optional)"
          value={this.state.pendingDisplayName}
          onChange={this.setDisplayName}
          disabled={useRemoteDisplayName}
        />
        <label>
          <input
            type="checkbox"
            checked={this.state.useRemoteDisplayName}
            onChange={this.setRemoteDisplayName}
          />
          {" Auto"}
        </label>
        <br />
        <button disabled={isValidating} onClick={this.onClickActivate}>
          {this.props.submitText}
        </button>
        {this.props.onAddFavorite && (
          <button disabled={isValidating} onClick={this.onClickFavorite}>
            Favorite
          </button>
        )}
        <datalist id="favorites">
          {favorites.map(item => (
            <option value={item.channelName} key={item.channelName} />
          ))}
        </datalist>
      </form>
    );
  }

  renderError() {
    if (this.isKnownBad()) {
      return "Not a Twitch channel";
    }
    if (this.state.pendingChannelName && !this.isValid()) {
      return 'e.g. "lirik"';
    }
  }

  setChannelName = (e: ChangeEvent<HTMLInputElement>) => {
    let channelName = e.currentTarget.value.toLowerCase();
    e.currentTarget.value = channelName;
    channelName = channelName.trim();
    if (channelName === this.state.pendingChannelName) {
      return;
    }
    this.setState({
      pendingChannelName: channelName
    });
  };

  setDisplayName = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      pendingDisplayName: e.currentTarget.value
    });
  };

  setRemoteDisplayName = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      pendingDisplayName: "",
      useRemoteDisplayName: e.currentTarget.checked
    });
  };

  onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  onClickFavorite = () => {
    this.checkValidRemote().then(isValid => {
      if (!isValid || !this.props.onAddFavorite) {
        return;
      }
      this.props.onAddFavorite(
        this.state.pendingChannelName,
        this.state.pendingDisplayName
      );
      this.setState({
        pendingChannelName: "",
        pendingDisplayName: ""
      });
    });
  };

  onClickActivate = () => {
    this.checkValidRemote().then(isValid => {
      if (!isValid) {
        return;
      }
      this.props.onActivate({
        channelName: this.state.pendingChannelName,
        displayName: this.state.pendingDisplayName
      });
      this.setState({
        pendingChannelName: "",
        pendingDisplayName: ""
      });
    });
  };

  isValid(channelName = this.state.pendingChannelName) {
    return !channelName || LOGIN_REGEX.test(channelName);
  }

  isKnownBad(channelName = this.state.pendingChannelName) {
    if (channelName && typeof remoteCheckCache[channelName] === "boolean") {
      return !remoteCheckCache[channelName];
    }
    return false;
  }

  async checkValidRemote() {
    if (this.state.isValidating) {
      return false;
    }
    if (!this.isValid()) {
      return false;
    }

    const channelName = this.state.pendingChannelName;
    if (
      !this.state.useRemoteDisplayName &&
      typeof remoteCheckCache[channelName] === "boolean"
    ) {
      return remoteCheckCache[channelName];
    }
    this.setState({
      isValidating: true
    });

    const response = await getUserInfo([channelName]);
    let ret = false;
    // fill in display name if left blank?
    if (response.length && response[0]) {
      if (this.state.useRemoteDisplayName) {
        const pendingDisplayName = response[0].display_name;
        await new Promise<void>(resolve => {
          this.setState(
            {
              pendingDisplayName
            },
            () => resolve()
          );
        });
      }
      ret = true;
    }

    remoteCheckCache[channelName] = ret;
    this.setState({
      isValidating: false
    });
    return ret;
  }
}

export function ChannelInput(props: Props) {
  const { config } = useContext(ConfigContext);
  return <ChannelInputImpl favorites={config.settings.favorites} {...props} />;
}
