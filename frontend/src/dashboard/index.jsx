// @ts-check
import '../common-styles.css';
import './style.css';
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
	};
	/** @type {Config} */
	config;

	componentDidMount() {
		if (typeof Twitch !== 'undefined' && Twitch.ext) {
			Twitch.ext.onAuthorized((auth) => {
				this.setState({ auth });
			});
			this.config = new Config(() => {
				const liveItems = {};
				for (const item of this.config.liveState.liveItems) {
					liveItems[item.id] = item;
				}
				this.setState({
					liveItems,
					layout: this.config.settings.configuredLayouts.length ? this.config.settings.configuredLayouts[0] : defaultLayout,
				});
			});
		}
	}

	render() {
		// TODO render slot select
		// TODO render current state of slot
		// TOOD rename/migrate queue into saved list of favorite channels
		const layoutItem = this.state.layout.positions[this.state.editingPosition];
		/** @type {LiveButton} */
		const liveItem = (layoutItem && this.state.liveItems[layoutItem.id]) || {};
		return (
			<div>
				{this.state.layout.positions.length > 1 && <select value={this.state.editingPosition}>
					{this.state.layout.positions.map((item, i) => {
						const label = String.fromCharCode(startingCharCode + i);
						return (
							<option key={item.id} value={i}>{item.type + ' ' + label}</option>
						);
					})}
				</select>}
				<Status
					channelName={liveItem.channelName}
					displayName={liveItem.displayName}
				/>
				<ChannelQueue
					channelName={this.state.channelName}
					onChange={this.updateChannel}
					onClear={this.clearChannel}
					clientID={this.state.auth && this.state.auth.clientId}
				/>
			</div>
		);
	}

	/**
	 * @param {LiveButton} liveInfo
	 */
	updateChannel = (liveInfo) => {
		const layoutItem = this.state.layout.positions[this.state.editingPosition];
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
		this.config.setLiveState(Object.values(liveItems));
	}

	clearChannel = () => {
		const layoutItem = this.state.layout.positions[this.state.editingPosition];
		const liveItems = iassign(this.state.liveItems, (liveItems) => {
			delete liveItems[layoutItem.id]
			return liveItems;
		});
		this.config.setLiveState(Object.values(liveItems));
		this.setState({
			liveItems,
		});
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
