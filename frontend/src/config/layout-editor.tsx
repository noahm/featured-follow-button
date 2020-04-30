import iassign from "immutable-assign";
import { Component, ChangeEvent } from "react";
import Dropzone from "react-dropzone";
import { FollowZone } from "./follow-zone";
import { DraggableButton } from "./draggable-button";
import styles from "./layout-editor.css";
import { ConfigState } from "../config";
import { getRandomID } from "../utils";
import { LayoutItem } from "../models";
import { Auth } from "../auth";
import { AsyncButton } from "../common/async-button";

const startingCharCode = "A".charCodeAt(0);

interface Props {
  config: ConfigState;
}

interface State {
  background: string | undefined;
}

function liveThumbnail(channel: string, height = 480) {
  const width = Math.round((height * 16) / 9);
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}-${width}x${height}.jpg?t=${Date.now()}`;
}

export class LayoutEditor extends Component<Props, State> {
  state: State = {
    background: undefined,
  };

  componentDidMount() {
    Auth.authAvailable.then(this.refreshBackground);
  }

  render() {
    if (!this.props.config.available) {
      return <p>Waiting for config to be available...</p>;
    }

    const layout = this.getLayout();
    return (
      <div>
        <p>
          You can configure a custom layout below. Each button and zone acts as
          a "slot" that can be either filled or left unused and invisible during
          a stream. Don't forget to save when you're done editing!
        </p>
        <p>
          Buttons will grow in length as longer channel names are used, but you
          can control the direction they grow in. Right click to toggle whether
          buttons are positioned by their left or right edge.
        </p>
        <div className={styles.toolbar}>
          <section>
            <button onClick={this.addButton}>Add Button</button>
            <button onClick={this.addZone}>Add Zone</button>
            <select value="initial" onChange={this.handleDelete}>
              <option value="initial" disabled>
                Delete...
              </option>
              {layout.positions.map((item, i) => {
                const label = String.fromCharCode(startingCharCode + i);
                return (
                  <option key={item.id} value={i}>
                    {item.type + " " + label}
                  </option>
                );
              })}
            </select>
          </section>
          <section>
            <AsyncButton
              onClick={this.refreshBackground}
              title="Try to grab an updated thumbnail from your live stream. (Twitch updates these every ~5min)"
            >
              Refresh Background
            </AsyncButton>
          </section>
        </div>
        <Dropzone
          accept="image/*"
          disableClick
          multiple={false}
          onDrop={this.onDrop}
          className={styles.dropzone}
        >
          {this.state.background && (
            <img src={this.state.background} className={styles.layoutArea} />
          )}
          {!this.state.background && (
            <div className={styles.layoutArea + " " + styles.backgroundPrompt}>
              Drop an image of your stream layout here
            </div>
          )}
          <div className={styles.layoutContainer}>
            <div className={styles.layoutArea}>
              {layout.positions.map((item, i) => {
                if (item.type === "quick") {
                  return;
                }
                const label = String.fromCharCode(startingCharCode + i);
                const defaultPosition = { top: item.top, left: item.left };
                if (item.type === "button") {
                  return (
                    <DraggableButton
                      key={item.id}
                      item={item}
                      onChange={this.updateItem}
                      defaultPosition={defaultPosition}
                      identifier={label}
                    />
                  );
                } else {
                  const defaultSize = {
                    height: item.height,
                    width: item.width,
                  };
                  return (
                    <FollowZone
                      key={item.id}
                      item={item}
                      onChange={this.updateItem}
                      defaultPosition={defaultPosition}
                      defaultSize={defaultSize}
                    >
                      {label}
                    </FollowZone>
                  );
                }
              })}
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  private getLayout(props = this.props) {
    return props.config.config.settings.configuredLayouts[0];
  }

  private refreshBackground = async () => {
    if (!Auth.userLogin) {
      return;
    }
    const resp = await fetch(liveThumbnail(Auth.userLogin, 1080));
    if (resp?.url?.match(/previews-ttv/)) {
      this.setState({
        background: resp.url,
      });
    }
  };

  private addButton = () => {
    this.addItem({
      type: "button",
      id: getRandomID(),
      top: 0,
      left: 0,
      align: "left",
    });
  };

  private addZone = () => {
    this.addItem({
      type: "zone",
      id: getRandomID(),
      top: 0,
      left: 0,
      height: 25,
      width: 25,
    });
  };

  private addItem = (newItem: LayoutItem) => {
    const layout = iassign(
      this.getLayout(),
      (l) => l.positions,
      (positions) => {
        positions.push(newItem);
        return positions;
      }
    );
    this.props.config.saveLayout(layout);
  };

  private handleDelete = (e: ChangeEvent<HTMLSelectElement>) => {
    const deleteIndex = +e.currentTarget.value;
    if (!Number.isInteger(deleteIndex)) {
      return;
    }
    const layout = iassign(
      this.getLayout(),
      (l) => l.positions,
      (positions) => {
        positions.splice(deleteIndex, 1);
        return positions;
      }
    );
    this.props.config.saveLayout(layout);
  };

  private onDrop = (files: Blob[]) => {
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        background: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  private updateItem = (newItem: LayoutItem) => {
    const layout = iassign(this.getLayout(), (layout) => {
      layout.positions = layout.positions.map((item) =>
        item.id === newItem.id ? newItem : item
      );
      return layout;
    });
    this.props.config.saveLayout(layout);
  };
}
