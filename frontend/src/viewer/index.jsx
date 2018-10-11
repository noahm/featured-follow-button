import '../common-styles';
import classNames from 'classnames';
import { parse } from 'querystringify';
import styles from './style';
import { Component } from 'react';
import { render } from 'react-dom';
import { getInitialState } from '../utils';

const knownFollows = new Set();

class App extends Component {
	state = {
		auth: null,
		animateOut: false,
		buttonHidden: false,
		channelName: '',
		displayName: '',
		followUiOpen: false,
		componentMode: false,
	};

	componentDidMount() {
		if (parse(window.location.search).anchor === 'component') {
			this.setState({
				componentMode: true,
			});
		}
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
				Twitch.ext.listen('broadcast', this.onExtensionBroadcast);
				Twitch.ext.actions.onFollow(this.onFollowUiClosed);
			});
		}
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextState.auth && !this.state.auth) {
			// TODO: potentially add random jitter here to help buffer F5 storms
			getInitialState(nextState.auth.channelId).then((state) => {
				this.updateChannel(state);
			});
		}
	}

	render() {
		if (!this.state.auth) {
			return null;
		}

		return (
			<main>
				<div className={this.state.componentMode ? styles.componentMode : styles.lowerThird}>
					{this.renderButton()}
				</div>
			</main>
		);
	}

	renderButton() {
		const { animateOut, buttonHidden, channelName, displayName } = this.state;

		if (!channelName || buttonHidden) {
			return null;
		}

		return (
			<div key={channelName} onAnimationEnd={this.animationEnded} className={classNames(styles.animation, styles.animationShow, { [styles.animationHide]: animateOut })}>
				<div className={styles.animationSlide}>
					<button disabled={this.state.followUiOpen} className={styles.button} onClick={this.onFollowClick}>
						<span className={styles.buttonText}>
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
				buttonHidden: true,
			});
		}
	}

	updateChannel(newState) {
		if (this.state.channelName && !newState.channelName && !this.state.animateOut) {
			this.setState({
				animateOut: true,
			});
		} else if (
			(
				this.state.channelName !== newState.channelName
				|| this.state.displayName !== newState.displayName
			) && !knownFollows.has(newState.channelName)
		) {
			this.setState({
				animateOut: false,
				buttonHidden: false,
				channelName: newState.channelName,
				displayName: newState.displayName,
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

	onFollowUiClosed = (didFollow, channelName) => {
		if (didFollow) {
			knownFollows.add(channelName);
		}
		this.setState({
			followUiOpen: false,
			animateOut: true,
		});
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
