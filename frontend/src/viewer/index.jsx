import '../common-styles';
import './style';
import { Component } from 'preact';
import { getUsername } from '../utils';

class App extends Component {
	state = {
		auth: null,
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

	render() {
		if (!this.state.auth) {
			return null;
		}

		return (
			<main>
				<div className="lower-third">
					{this.renderButton()}
				</div>
			</main>
		);
	}

	renderButton() {
		const { animateOut, channelName, displayName } = this.state;

		if (!channelName || !animateOut) {
			return null;
		}

		return (
			<div key={channelName} onAnimationEnd={this.animationEnded} className={'animation animationShow ' + (animateOut ? 'animationHide' : '')}>
				<div className="animationSlide">
					<button disabled={this.state.followUiOpen} className="button" onClick={this.onFollowClick}>
						<span className="buttonText">
							<svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px">
								<path clipRule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fillRule="evenodd" />
							</svg>
							Follow {displayName || channelName}
						</span>
					</button>
				</div>
			</div>
		);
	}

	onExtensionBroadcast = (target, contentType, message) => {
		try {
			const decodedMessage = JSON.parse(message);
			if (decodedMessage && (
				// update if this gives us any channel while not displaying
				(decodedMessage.channelName && this.state.animateOut)
				// or update if the values are changing while displaying
				|| !this.state.animateOut && (
					decodedMessage.channelName !== this.state.channelName
					|| decodedMessage.displayName !== this.state.displayName
				)
				
			)) {
				this.updateChannel(decodedMessage);
			}
		} catch (_) { }
	}

	animationEnded = () => {
		if (this.state.animateOut) {
			this.setState({
				channelName: '',
				displayName: '',
			});
		}
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

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
