import '../common-styles';
import { Component } from 'react';
import { render } from 'react-dom';
import styles from './style.css';
import { Config } from '../config';
import { getAnchorMode, defaultLayout } from '../utils';
import { FollowButton } from './follow-button';
import { FollowZone } from './follow-zone';

class App extends Component {
	state = {
		animateOut: false,
		itemsHidden: false,
		/** @type {LiveItems} */
		liveItems: [{
			type: 'button',
			id: -1,
			channelName: 'me',
			top: 5,
			left: 5,
		}],
		followUiOpen: false,
		componentMode: getAnchorMode() === 'component',
	};

	/** @type {Config} */
	config;

	constructor(props) {
		super(props);
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			this.config = new Config();
			this.config.configAvailable.then(() => {
				this.updateChannel(this.config.liveState);
			});
			Twitch.ext.onAuthorized((auth) => {
				Twitch.ext.listen('broadcast', this.onExtensionBroadcast);
				Twitch.ext.actions.onFollow(this.onFollowUiClosed);
			});
		}
	}

	render() {
		if (!this.state.liveItems.length) {
			return null;
		}

		if (this.state.componentMode) {
			return (
				<main>
					<div className={styles.componentMode}>
						{this.renderItem(this.state.liveItems.find(i => i.type === 'button'))}
					</div>
				</main>
			);
		}

		return (
			<main>
				{this.state.liveItems.map(this.renderItem)}
			</main>
		);
	}

	/**
	 * @param {LiveLayoutItem} item 
	 */
	renderItem = (item) => {
		const { animateOut, itemsHidden, followUiOpen, componentMode } = this.state;

		if (itemsHidden || !item || !item.channelName) {
			return null;
		}

		if (item.type === 'button') {
			return (
				<FollowButton
					key={item.id}
					animateOut={animateOut}
					disabled={followUiOpen}
					onClick={() => this.onFollowClick(item)}
					onAnimationEnd={this.animationEnded}
					item={item}
					componentMode={componentMode}
				/>
			);
		} else if (!animateOut) {
			return (
				<FollowZone
					key={item.id}
					disabled={followUiOpen}
					onClick={() => this.onFollowClick(item)}
					item={item}
				/>
			);
		}
	}

	onExtensionBroadcast = (target, contentType, message) => {
		try {
			/** @type {LiveState} */
			const decodedMessage = JSON.parse(message);
			// TODO update logic to stop using legacy data format
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
		const currentID = this.state.liveItems.reduce((id, item) => id + ':' + item.id, '');
		const nextID = newState.newItems.reduce((id, item) => id + ':' + item.id, '');

		if (currentID && !nextID && !this.state.animateOut) {
			this.setState({
				animateOut: true,
			});
			return;
		}
		if (this.state.itemsHidden || nextID !== currentID) {
			this.setState({
				animateOut: false,
				buttonHidden: false,
				liveItems: newState.newItems,
			});
		}
	}

	/**
	 * @param {LiveLayoutItem} item
	 */
	onFollowClick = (item) => {
		if (!item.channelName) {
			return;
		}
		Twitch.ext.actions.followChannel(item.channelName);
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
