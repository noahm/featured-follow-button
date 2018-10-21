import { Component, CSSProperties, ChangeEvent } from 'react';
import Dropzone from 'react-dropzone';
import { FollowZone } from './follow-zone';
import { DraggableButton } from './draggable-button';
import styles from './layout-editor.css';
import { Config } from '../config';
import { getRandomID } from '../utils';

const startingCharCode = 'A'.charCodeAt(0);
/** @type {Array<LayoutItem>} */
const defaultLayout = [{ type: 'button', id: getRandomID(), top: 75, left: 75 }];

export class LayoutEditor extends Component {
  state = {
    background: undefined,
    /** @type {Array<LayoutItem>} */
    layout: [],
    isDirty: false,
  };

  /** @type {Config} */
  config;

  /** @type {Array<LayoutItem>} */
  dirtyLayout = [];

  componentDidMount() {
    this.config = new Config(() => {
      this.setState({
        layout: this.config.settings.configuredLayouts.length ? this.config.settings.configuredLayouts[0] : defaultLayout,
      });
    })
  }

  render() {
    return (
      <div>
        <div className={styles.toolbar}>
          <section>
            <button onClick={this.addButton}>Add Button</button>
            <button onClick={this.addZone}>Add Zone</button>
            <select value="initial" onChange={this.handleDelete}>
              <option value="initial" disabled>Delete...</option>
              {this.state.layout.map((item, i) => {
                const label = String.fromCharCode(startingCharCode + i);
                return <option key={item.id} value={i}>{label}</option>
              })}
            </select>
          </section>
          <section>
            {this.state.isDirty && <button onClick={this.save}>Save</button>}
          </section>
        </div>
        <Dropzone accept="image/*" disableClick multiple={false} onDrop={this.onDrop} className={styles.dropzone}>
          {this.state.background && <img src={this.state.background} className={styles.layoutArea} />}
          {!this.state.background && <div className={styles.layoutArea + ' ' + styles.backgroundPrompt}>
            Drop an image of your stream layout here
          </div>}
          <div className={styles.layoutContainer}>
            <div className={styles.layoutArea}>
              {this.state.layout.map((item, i) => {
                const label = String.fromCharCode(startingCharCode + i);
                const defaultPosition = { top: item.top, left: item.left };
                if (item.type === 'button') {
                  return <DraggableButton key={item.id} item={item} onChange={this.updateItem} defaultPosition={defaultPosition}>{label}</DraggableButton>;
                } else {
                  const defaultSize = { height: item.height, width: item.width };
                  return <FollowZone key={item.id} item={item} onChange={this.updateItem} defaultPosition={defaultPosition} defaultSize={defaultSize}>{label}</FollowZone>;
                }
              })}
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  /**
   * @param {ChangeEvent<HTMLSelectElement>} e
   */
  handleDelete = (e) => {
    const deleteIndex = +e.currentTarget.value;
    if (!Number.isInteger(deleteIndex)) {
      return;
    }
    this.setState((s) => {
      const layout = s.layout.slice();
      layout.splice(deleteIndex, 1);
      return {
        layout,
      };
    })
  }

  addButton = () => {
    this.setState((s) => {
      const layout = s.layout.slice();
      const newButton = { type: 'button', id: getRandomID(), top: 0, left: 0 };
      layout.push(newButton);
      if (s.isDirty) {
        this.dirtyLayout.push(newButton);
      }
      return {
        layout,
        isDirty: true,
      };
    });
  }

  addZone = () => {
    this.setState((s) => {
      const layout = s.layout.slice();
      const newZone = { type: 'zone', id: getRandomID(), top: 0, left: 0, height: 25, width: 25 };
      layout.push(newZone);
      if (s.isDirty) {
        this.dirtyLayout.push(newZone);
      }
      return {
        layout,
        isDirty: true,
      };
    });
  }

  onDrop = (files) => {
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        background: reader.result,
      });
    }
    reader.readAsDataURL(file);
  }

  /**
   * @param {LayoutItem} newItem
   */
  updateItem = (newItem) => {
    const layout = this.state.isDirty ? this.dirtyLayout : this.state.layout;
    this.dirtyLayout = layout.map(item => item.id === newItem.id ? newItem : item);
    if (!this.state.isDirty) {
      this.setState({
        isDirty: true,
      });
    }
  }

  save = () => {
    this.config.saveLayout(this.dirtyLayout);
    this.setState({
      isDirty: false,
      layout: this.dirtyLayout,
    });
  }
}
