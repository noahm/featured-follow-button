import '../common-styles';
import './style';
import { Component, render } from 'preact';
import { Status } from './components/status';
import { ChannelQueue } from './components/channel-queue';

class App extends Component {
	state = {
		auth: null,
		channelName: '',
		displayName: '',
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
		fetch('https://follow-btn.manneschmidt.net:4430/followButton/' + this.state.auth.channelId, {
			method: 'POST',
			body: JSON.stringify({
				channelName,
				displayName,
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-Extension-JWT': this.state.auth.token,
			},
		}).catch((e) => {
		});
	}

	clearChannel = () => {
		this.updateChannel();
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
