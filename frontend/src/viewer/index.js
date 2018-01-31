import '../common-styles';
import './style';
import { Component } from 'preact';
import { getUsername } from '../utils';

export default class App extends Component {
	state = {
		animateOut: false,
		channelName: '',
		displayName: '',
	};

	componentWillMount() {
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
				Twitch.ext.listen('broadcast', (target, contentType, message) => {
					try {
						const decodedMessage = JSON.parse(message);
						if (decodedMessage && (
								decodedMessage.channelName !== this.state.channelName
								|| decodedMessage.displayName !== this.state.displayName
							)
						) {
							this.updateChannel(decodedMessage);
						}
					} catch (_) {}
				});
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
							<button className="button">
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
}
