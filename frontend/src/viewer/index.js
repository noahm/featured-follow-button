import '../common-styles';
import './style';
import { Component } from 'preact';
import { getUsername } from '../utils';

export default class App extends Component {
	state = {
		animateOut: false,
		channelName: '',
		displayName: '',
		followUiOpen: false,
	};

	componentWillMount() {
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
				Twitch.ext.listen('broadcast', this.onExtensionBroadcast);
				Twitch.ext.actions.onFollow(this.onFollowUiClosed);
			});
		}
	}

	render(_, { animateOut, channelName, displayName }) {
		if (!this.state.auth) {
			return null;
		}

		if (!channelName && !animateOut) {
			return null;
		}

		return (
			<main>
				<div className="lower-third">
					<div className={'animation animationShow ' + (animateOut ? 'animationHide' : '')}>
						<div className="animationSlide">
							<button disabled={this.state.followUiOpen} className="button" onClick={this.onFollowClick}>
								<span className="buttonText">
									&lt;3 Follow {getUsername(channelName, displayName)}
								</span>
							</button>
						</div>
					</div>
				</div>
			</main>
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
				this.updateChannel(decodedMessage);
			}
		} catch (_) { }
	}

	updateChannel(channel) {
		if (this.state.channelName && !channel.channelName && !this.state.animateOut) {
			this.setState({
				animateOut: true,
			});
		} else {
			this.setState({
				animateOut: false,
				channelName: channel.channelName,
				displayName: channel.displayName,
			});
		}
	}

	onFollowClick = () => {
		if (!this.state.channelName) {
			return;
		}
		Twitch.ext.actions.followChannel(this.state.channelName);
		this.setState({
			followUiOpen: true,
		});
	}

	onFollowUiClosed = () => {
		this.setState({
			followUiOpen: false,
		});
	}
}
