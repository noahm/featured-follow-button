import '../common-styles.css';
import './style';
import { applyThemeClass } from '../common-styles';
import { Component, render } from 'preact';
import { backendHost } from '../utils';
import { Status } from './components/status';
import { ChannelQueue } from './components/channel-queue';

const ERROR_DISPLAY_PERIOD = 15000;

class App extends Component {
	state = {
		auth: null,
		channelName: '',
		displayName: '',
		requestErrored: false,
	};

	componentWillMount() {
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
				Twitch.ext.listen('broadcast', this.onExtensionBroadcast);
			});
		}
	}

	render() {
		if (!this.state.auth) {
			return <div>waiting for twitch...</div>;
		}

		return (
			<div>
				<Status
					channelName={this.state.channelName}
					displayName={this.state.displayName}
					isErrored={this.state.requestErrored}
				/>
				<ChannelQueue
					channelName={this.state.channelName}
					onChange={this.updateChannel}
					onClear={this.clearChannel}
				/>
			</div>
		);
	}

	onExtensionBroadcast = (target, contentType, message) => {
		try {
			const decodedMessage = JSON.parse(message);
			if (decodedMessage && (
				decodedMessage.channelName !== this.state.channelName
				|| decodedMessage.displayName !== this.state.displayName
			)
			) {
				this.setState({
					channelName: decodedMessage.channelName,
					displayName: decodedMessage.displayName,
				});
			}
		} catch (_) { }
	}

	updateChannel = (channelName = '', displayName = '') => {
		this.setState({ channelName, displayName });
		const currentChannel = this.state.auth ? this.state.auth.channelId : 0;
		fetch(backendHost + '/followButton/' + currentChannel, {
			method: 'POST',
			body: JSON.stringify({
				channelName,
				displayName,
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-Extension-JWT': this.state.auth ? this.state.auth.token : '',
			},
		}).then(() => {
			this.clearErrorState();
		}).catch(() => {
			if (!this.state.requestErrored) {
				this.setState({
					requestErrored: true,
				}, () => {
					// clear error state after some time
					setTimeout(this.clearErrorState, ERROR_DISPLAY_PERIOD);
				});
			}
		});
	}

	clearErrorState = () => {
		if (this.state.requestErrored) {
			this.setState({ requestErrored: false });
		}
	}

	clearChannel = () => {
		this.updateChannel();
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
