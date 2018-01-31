import '../common-styles';
import './style';
import { Component } from 'preact';
import { Status } from './components/status';
import { ChannelQueue } from './components/channel-queue';

export default class App extends Component {
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
			return <div>waiting for auth from twitch...</div>;
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
		}).catch(function (e) {
		});
	}

	clearChannel = () => {
		this.updateChannel();
	}
}
