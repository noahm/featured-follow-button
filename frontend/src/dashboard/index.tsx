import "../common-styles.css";
import styles from "./style.css";
import { applyThemeClass } from "../common-styles";
import iassign from "immutable-assign";
import { Component, ChangeEvent } from "react";
import { render } from "react-dom";
import { Config } from "../config";
import { defaultLayout } from "../utils";
import { Status } from "./components/status";
import { ChannelQueue } from "./components/channel-queue";
import { Layout, LiveLayoutItem, LiveButton } from "../models";

const startingCharCode = "A".charCodeAt(0);

interface State {
  layout: Layout;
  liveItems: Record<string, LiveLayoutItem>;
  editingPosition: number;
  globalHide: boolean;
}

class App extends Component<{}, State> {
  state: State = {
    layout: defaultLayout,
    liveItems: {},
    editingPosition: 0,
    globalHide: false
  };
  config: Config;

  constructor(props: {}) {
    super(props);
    this.config = new Config();
    this.config.onLayoutBroadcast = this.updateLayoutFromConfig;
    this.config.onLiveBroadcast = this.updateFromLiveBroadcast;
    this.config.configAvailable.then(() => {
      this.updateFromLiveBroadcast();
      this.updateLayoutFromConfig();
    });
  }

  render() {
    return (
      <div>
        <label
          className={styles.hideAll}
          title="Hides buttons from viewers (but not you, the broadcaster)"
        >
          <input
            type="checkbox"
            checked={!!this.state.globalHide}
            onChange={this.toggleHide}
          />{" "}
          Hide All
        </label>
        {this.renderStatus()}
        <ChannelQueue config={this.config} onChange={this.updateChannel} />
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
          <select
            value={this.state.editingPosition}
            onChange={this.updateEditingPosition}
          >
            {this.state.layout.positions.map((item, i) => {
              const label = String.fromCharCode(startingCharCode + i);
              const channel = this.state.liveItems[item.id];
              return (
                <option key={item.id} value={i}>
                  {item.type + " " + label} -{" "}
                  {channel ? channel.channelName : "(inactive)"}
                </option>
              );
            })}
          </select>
          {liveItem.channelName && (
            <button onClick={this.clearChannel}>Clear</button>
          )}
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

  updateLayoutFromConfig = () => {
    let layout = this.config.settings.configuredLayouts[0];
    if (!layout || !layout.positions || !layout.positions.length) {
      layout = defaultLayout;
    }
    this.setState({
      layout
    });
    if (this.state.editingPosition >= layout.positions.length) {
      this.setState({
        editingPosition: layout.positions.length - 1
      });
    }
  };

  updateFromLiveBroadcast = () => {
    const liveItems: Record<string, LiveLayoutItem> = {};
    for (const item of this.config.liveState.liveItems) {
      liveItems[item.id] = item;
    }
    this.setState({
      liveItems,
      globalHide: this.config.liveState.hideAll
    });
  };

  updateEditingPosition = (e: ChangeEvent<HTMLSelectElement>) => {
    const newPosition = +e.currentTarget.value;
    if (Number.isInteger(newPosition)) {
      this.setState({
        editingPosition: newPosition
      });
    }
  };

  toggleHide = () => {
    this.config.toggleHideAll();
    this.setState({
      globalHide: this.config.liveState.hideAll
    });
  };

  getLayoutItem = () => {
    return this.state.layout.positions.length
      ? this.state.layout.positions[this.state.editingPosition]
      : defaultLayout.positions[0];
  };

  updateChannel = (liveInfo: LiveButton) => {
    const layoutItem = this.getLayoutItem();
    const liveItem = {
      ...layoutItem,
      ...liveInfo
    };

    const liveItems = iassign(this.state.liveItems, liveItems => {
      liveItems[layoutItem.id] = liveItem;
      return liveItems;
    });

    this.setState({
      liveItems
    });
    this.config.setLiveItems(Object.values(liveItems));
  };

  clearChannel = () => {
    const layoutItem = this.state.layout.positions[this.state.editingPosition];
    const liveItems = iassign(this.state.liveItems, liveItems => {
      delete liveItems[layoutItem.id];
      return liveItems;
    });
    this.config.setLiveItems(Object.values(liveItems));
    this.setState({
      liveItems
    });
  };
}

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
