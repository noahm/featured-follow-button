import '../common-styles.css';
import styles from './style.css';
import { applyThemeClass } from '../common-styles';
import iassign from 'immutable-assign'
import { Component } from 'react';
import { render } from 'react-dom';
import { Auth } from '../auth';
import { Config } from '../config';
import { defaultLayout, getAnchorMode } from '../utils';
import { Status } from './components/status';
import { ChannelQueue } from './components/channel-queue';

const startingCharCode = 'A'.charCodeAt(0);

class App extends Component {
	state = {
		/** @type {Layout} */
		layout: defaultLayout,
		/** @type {Record<string, LiveLayoutItem>} */
		liveItems: {},
		editingPosition: 0,
		globalHide: false,
		componentMode: getAnchorMode() === 'component',
	};
	/** @type {Config} */
	config;

	constructor(props) {
		super(props);
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Auth.authAvailable.then(() => {
				Twitch.ext.listen(`whisper-${Auth.userID}`, this.handleLayoutBroadcast);
			});
			this.config = new Config();
			this.config.configAvailable.then(() => {
				const liveItems = {};
				for (const item of this.config.liveState.liveItems) {
					liveItems[item.id] = item;
				}
				this.setState({
					liveItems,
					globalHide: this.config.liveState.hideAll,
				});
				this.applyNewLayout(this.config.settings.configuredLayouts.length ? this.config.settings.configuredLayouts[0] : defaultLayout);
			});
		}
	}

	render() {
		return (
			<div>
				<label className={styles.hideAll}><input type="checkbox" checked={!!this.state.globalHide} onChange={this.toggleHide} /> Hide{this.state.componentMode ? '' : ' All'}</label>
				{this.renderStatus()}
				<ChannelQueue
					config={this.config}
					onChange={this.updateChannel}
				/>
			</div>
		);
	}

	renderStatus() {
		const layoutItem = this.getLayoutItem();
		/** @type {LiveButton} */
		const liveItem = (layoutItem && this.state.liveItems[layoutItem.id]) || {};

		if (!this.state.componentMode && this.state.layout.positions.length > 1) {
			return (
				<div className={styles.slotSelect}>
					Editing position: <br />
					<select value={this.state.editingPosition} onChange={this.updateEditingPosition}>
						{this.state.layout.positions.map((item, i) => {
							const label = String.fromCharCode(startingCharCode + i);
							const channel = this.state.liveItems[item.id];
							return (
								<option key={item.id} value={i}>{item.type + ' ' + label} - {channel ? channel.channelName : '(inactive)'}</option>
							);
						})}
					</select>
					{liveItem.channelName && <button onClick={this.clearChannel}>Clear</button>}
				</div>
			);
		}

		return (
			<Status
				channelName={liveItem.channelName}
				displayName={liveItem.displayName}
				onClear={this.clearChannel}
			/>
		);
	}

	handleLayoutBroadcast = (target, contentType, message) => {
		try {
			/** @type {Layout} */
			const decodedMessage = JSON.parse(message);
			if (decodedMessage) {
				this.applyNewLayout(decodedMessage);
			}
		} catch (_) { }
	}

	/**
	 * 
	 * @param {Layout} layout
	 */
	applyNewLayout(layout) {
		if (!layout || !layout.positions || !layout.positions.length) {
			layout = defaultLayout;
		}
		this.setState({
			layout,
		});
		if (this.state.componentMode) {
			this.setState({
				editingPosition: layout.positions.findIndex(item => item.type === 'button'),
			});
		} else if (this.state.editingPosition >= layout.positions.length) {
			this.setState({
				editingPosition: layout.positions.length - 1,
			});
		}
	}

	updateEditingPosition = (e) => {
		const newPosition = +e.currentTarget.value;
		if (Number.isInteger(newPosition)) {
			this.setState({
				editingPosition: newPosition,
			});
		}
	}

	toggleHide = () => {
		this.config.toggleHideAll();
		this.setState({
			globalHide: this.config.liveState.hideAll,
		});
	}

	getLayoutItem = () => {
		return this.state.layout.positions.length && !this.state.componentMode ? this.state.layout.positions[this.state.editingPosition] : defaultLayout.positions[0];
	}

	/**
	 * @param {LiveButton} liveInfo
	 */
	updateChannel = (liveInfo) => {
		const layoutItem = this.getLayoutItem();
		const liveItem = {
			...layoutItem,
			...liveInfo,
		};

		const liveItems = iassign(this.state.liveItems, (liveItems) => {
			liveItems[layoutItem.id] = liveItem;
			return liveItems;
		});

		this.setState({
			liveItems,
		});
		this.config.setLiveItems(Object.values(liveItems));
	}

	clearChannel = () => {
		const layoutItem = this.state.layout.positions[this.state.editingPosition];
		const liveItems = iassign(this.state.liveItems, (liveItems) => {
			delete liveItems[layoutItem.id]
			return liveItems;
		});
		this.config.setLiveItems(Object.values(liveItems));
		this.setState({
			liveItems,
		});
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
