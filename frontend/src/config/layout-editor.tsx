import iassign from "immutable-assign";
import { Component, ChangeEvent } from "react";
import Dropzone from "react-dropzone";
import { FollowZone } from "./follow-zone";
import { DraggableButton } from "./draggable-button";
import styles from "./layout-editor.css";
import { ConfigState } from "../config";
import { getRandomID } from "../utils";
import { Layout, LayoutItem } from "../models";
import { Auth } from "../auth";

const startingCharCode = "A".charCodeAt(0);

interface Props {
  config: ConfigState;
}

interface State {
  background: string | undefined;
  layout: Layout;
  isDirty: boolean;
}

function liveThumbnail(channel: string, height = 480) {
  const width = (height * 16) / 9;
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}-${width}x${height}.jpg`;
}

export class LayoutEditor extends Component<Props, State> {
  dirtyLayout: Layout | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      background: undefined,
      layout: props.config.config.settings.configuredLayouts[0],
      isDirty: false,
    };
  }

  componentDidMount() {
    Auth.authAvailable
      .then(() => fetch(liveThumbnail(Auth.userLogin!, 1080)))
      .then((resp) => {
        if (resp.url.match(/previews-ttv/)) {
          this.setState({
            background: resp.url,
          });
        }
      });
  }

  componentDidUpdate(prevProps: Props) {
    if (
      !prevProps.config.available &&
      this.props.config.available &&
      this.state.layout !==
        this.props.config.config.settings.configuredLayouts[0] &&
      !this.dirtyLayout
    ) {
      this.setState({
        layout: this.props.config.config.settings.configuredLayouts[0],
      });
    }
  }

  render() {
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
              {this.state.layout.positions.map((item, i) => {
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
            {this.state.isDirty && <button onClick={this.save}>Save</button>}
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
              {this.state.layout.positions.map((item, i) => {
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

  addButton = () => {
    this.addItem({
      type: "button",
      id: getRandomID(),
      top: 0,
      left: 0,
      align: "left",
    });
  };

  addZone = () => {
    this.addItem({
      type: "zone",
      id: getRandomID(),
      top: 0,
      left: 0,
      height: 25,
      width: 25,
    });
  };

  addItem = (newItem: LayoutItem) => {
    this.setState((s) => {
      const layout = iassign(
        s.layout,
        (l) => l.positions,
        (positions) => {
          positions.push(newItem);
          return positions;
        }
      );
      if (this.dirtyLayout) {
        this.dirtyLayout = iassign(
          this.dirtyLayout,
          (l) => l.positions,
          (positions) => {
            positions.push(newItem);
            return positions;
          }
        );
      }
      return {
        layout,
        isDirty: true,
      };
    });
  };

  handleDelete = (e: ChangeEvent<HTMLSelectElement>) => {
    const deleteIndex = +e.currentTarget.value;
    if (!Number.isInteger(deleteIndex)) {
      return;
    }
    this.setState((s) => {
      const layout = iassign(
        s.layout,
        (l) => l.positions,
        (positions) => {
          positions.splice(deleteIndex, 1);
          return positions;
        }
      );
      if (this.dirtyLayout) {
        this.dirtyLayout = iassign(
          this.dirtyLayout,
          (l) => l.positions,
          (positions) => {
            positions.splice(deleteIndex, 1);
            return positions;
          }
        );
      }
      return {
        layout,
        isDirty: true,
      };
    });
  };

  onDrop = (files: Blob[]) => {
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

  updateItem = (newItem: LayoutItem) => {
    const layout =
      this.state.isDirty && this.dirtyLayout
        ? this.dirtyLayout
        : this.state.layout;
    this.dirtyLayout = iassign(layout, (layout) => {
      layout.positions = layout.positions.map((item) =>
        item.id === newItem.id ? newItem : item
      );
      return layout;
    });
    if (!this.state.isDirty) {
      this.setState({
        isDirty: true,
      });
    }
  };

  save = () => {
    const newLayout = this.dirtyLayout || this.state.layout;
    this.props.config.saveLayout(newLayout);
    this.setState({
      isDirty: false,
      layout: newLayout,
    });
  };
}
