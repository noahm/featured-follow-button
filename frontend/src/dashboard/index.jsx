import '../common-styles.css';
import styles from './style.css';
import { applyThemeClass } from '../common-styles';
import iassign from 'immutable-assign'
import { Component } from 'react';
import { render } from 'react-dom';
import { Config } from '../config';
import { defaultLayout } from '../utils';
import { Status } from './components/status';
import { ChannelQueue } from './components/channel-queue';

const startingCharCode = 'A'.charCodeAt(0);

class App extends Component {
	state = {
		/** @type {Twitch.AuthCallback} */
		auth: null,
		/** @type {Layout} */
		layout: defaultLayout,
		/** @type {Record<string, LiveLayoutItem>} */
		liveItems: {},
		editingPosition: 0,
		globalHide: false,
	};
	/** @type {Config} */
	config;

	constructor(props) {
		super(props);
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
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
					layout: this.config.settings.configuredLayouts.length ? this.config.settings.configuredLayouts[0] : defaultLayout,
				});
			});
		}
	}

	render() {
		return (
			<div>
				<label className={styles.hideAll}><input type="checkbox" checked={!!this.state.globalHide} onChange={this.toggleHide} /> Hide All</label>
				{this.renderStatus()}
				<ChannelQueue
					config={this.config}
					onChange={this.updateChannel}
					clientID={this.state.auth && this.state.auth.clientId}
				/>
			</div>
		);
	}

	renderStatus() {
		const layoutItem = this.getLayoutItem();
		/** @type {LiveButton} */
		const liveItem = (layoutItem && this.state.liveItems[layoutItem.id]) || {};

		if (this.state.layout.positions.length > 1) {
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

	getLayoutItem = () => this.state.layout.positions.length ? this.state.layout.positions[this.state.editingPosition] : defaultLayout.positions[0];

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
