import { Component, CSSProperties, ChangeEvent } from 'react';
import Dropzone from 'react-dropzone';
import Draggable from 'react-draggable';
import { FollowZone } from './follow-zone';
import { FollowButton } from './follow-button';
import styles from './layout-editor.css';

export class LayoutEditor extends Component {
  state = {
    background: undefined,
    layout: [
      { type: 'button', top: 0, left: 0 },
      { type: 'zone', top: 50, left: 50, height: 25, width: 25 },
    ],
  };
  startingCharCode = 'A'.charCodeAt(0);

  render() {
    return (
      <div>
        <div>
          <button onClick={this.addButton}>Add Button</button>
          <button onClick={this.addZone}>Add Zone</button>
          <select value="initial" onChange={this.handleDelete}>
            <option value="initial" disabled>Delete...</option>
            {this.state.layout.map((item, i) => {
              const label = String.fromCharCode(this.startingCharCode + i);
              return <option key={label} value={i}>{label}</option>
            })}
          </select>
        </div>
        <Dropzone accept="image/*" disableClick multiple={false} onDrop={this.onDrop} style={this.getDropzoneStyles()}>
          <div style={{ height: '720px', width: '1280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {this.state.background ? <img src={this.state.background} style={{ height: '100%' }} /> : <div>Drop an image of your stream layout here</div>}
            <div style={{ position: "absolute", height: '100%', width: '100%' }}>
              {this.state.layout.map((item, i) => {
                const label = String.fromCharCode(this.startingCharCode + i);
                if (item.type === 'button') {
                  return (
                    <Draggable key={label} bounds="parent" defaultClassName={styles.draggable} defaultClassNameDragging={styles.dragging} defaultPosition={{ x: item.left, y: item.top }}>
                      <div><FollowButton>{label}</FollowButton></div>
                    </Draggable>
                  );
                } else {
                  return <FollowZone key={label}>{label}</FollowZone>;
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
      layout.push({ type: 'button', top: 0, left: 0 });
      return {
        layout,
      };
    });
  }

  addZone = () => {
    this.setState((s) => {
      const layout = s.layout.slice();
      layout.push({ type: 'zone', top: 0, left: 0, height: 25, width: 25 });
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
