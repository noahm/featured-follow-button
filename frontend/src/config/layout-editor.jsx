import { Component, CSSProperties, ChangeEvent } from 'react';
import Dropzone from 'react-dropzone';
import { FollowZone } from './follow-zone';
import { DraggableButton } from './draggable-button';
import styles from './layout-editor.css';
import { getRandomID } from '../utils';

const startingCharCode = 'A'.charCodeAt(0);

export class LayoutEditor extends Component {
  state = {
    background: undefined,
    layout: [
      { type: 'button', id: getRandomID(), top: 5, left: 5 },
      { type: 'zone', id: getRandomID(), top: 75, left: 75, height: 10, width: 10 },
    ],
  };

  render() {
    return (
      <div>
        <div className={styles.toolbar}>
          <button onClick={this.addButton}>Add Button</button>
          <button onClick={this.addZone}>Add Zone</button>
          <select value="initial" onChange={this.handleDelete}>
            <option value="initial" disabled>Delete...</option>
            {this.state.layout.map((item, i) => {
              const label = String.fromCharCode(startingCharCode + i);
              return <option key={item.id} value={i}>{label}</option>
            })}
          </select>
        </div>
        <Dropzone accept="image/*" disableClick multiple={false} onDrop={this.onDrop} style={this.getDropzoneStyles()}>
          <div className={styles.layoutContainer}>
            {this.state.background ? <img src={this.state.background} style={{ height: '100%' }} /> : <div>Drop an image of your stream layout here</div>}
            <div className={styles.layoutArea}>
              {this.state.layout.map((item, i) => {
                const label = String.fromCharCode(startingCharCode + i);
                const defaultPosition = { top: item.top, left: item.left };
                if (item.type === 'button') {
                  return <DraggableButton key={item.id} defaultPosition={defaultPosition}>{label}</DraggableButton>;
                } else {
                  const defaultSize = { height: item.height, width: item.width };
                  return <FollowZone key={item.id} defaultPosition={defaultPosition} defaultSize={defaultSize}>{label}</FollowZone>;
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
      layout.push({ type: 'button', id: getRandomID(), top: 0, left: 0 });
      return {
        layout,
      };
    });
  }

  addZone = () => {
    this.setState((s) => {
      const layout = s.layout.slice();
      layout.push({ type: 'zone', id: getRandomID(), top: 0, left: 0, height: 25, width: 25 });
      return {
        layout,
      };
    });
  }

  /** @return {CSSProperties} */
  getDropzoneStyles() {
    return {
      border: '2px #666 dotted',
      borderRadius: '5px',
      display: 'inline-block',
    };
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
}
