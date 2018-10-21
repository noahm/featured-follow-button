import '../common-styles';
import { parse } from 'querystringify';
import { Component } from 'react';
import { render } from 'react-dom';
import styles from './style.css';
import { Config } from '../config';
import { FollowButton } from './follow-button';

const knownFollows = new Set();

class App extends Component {
	state = {
		/** @type {AuthCallback} */
		auth: null,
		animateOut: false,
		buttonHidden: false,
		/** @type {LiveItems} */
		liveItems: [],
		followUiOpen: false,
		componentMode: false,
	};
	/** @type {Config} */
	config;

	componentDidMount() {
		if (parse(window.location.search).anchor === 'component') {
			this.setState({
				componentMode: true,
			});
		}

		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			this.config = new Config(() => {
				this.updateChannel(this.config.liveState);
			});
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
				<div className={this.state.componentMode ? styles.componentMode : styles.lowerThird}>
					{this.renderButton()}
				</div>
			</main>
		);
	}

	/**
	 * 
	 * @param {LiveLayoutItem} item 
	 */
	renderItem(item) {
		const { animateOut, buttonHidden, followUiOpen, componentMode } = this.state;

		if (!item.channelName || buttonHidden) {
			return null;
		}

		if (item.type === 'button') {
			return (
				<FollowButton
					key={item.channelName}
					animateOut={animateOut}
					disabled={followUiOpen}
					onClick={() => this.onFollowClick(item.channelName)}
					onAnimationEnd={this.animationEnded}
					channelName={item.channelName}
					displayName={item.displayName}
					componentMode={componentMode}
				/>
			);
		} else {
			return (
				null
			);
		}
	}

	onExtensionBroadcast = (target, contentType, message) => {
		try {
			/** @type {LiveState} */
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
		if (this.state.animateOut && !this.state.butt) {
			this.setState({
				buttonHidden: true,
			});
		}
	}

	/**
	 * @param {LiveState} newState
	 */
	updateChannel(newState) {
		if (this.state.channelName && !newState.channelName && !this.state.animateOut) {
			this.setState({
				animateOut: true,
			});
		} else if (
			this.state.buttonHidden || (
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

	onFollowClick = (channelName) => {
		if (!this.state.channelName) {
			return;
		}
		Twitch.ext.actions.followChannel(channelName);
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
