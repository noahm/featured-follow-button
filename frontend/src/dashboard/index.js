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
					onClear={this.clearChannel}
				/>
				<ChannelQueue onChange={this.updateChannel} />
			</div>
		);
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
