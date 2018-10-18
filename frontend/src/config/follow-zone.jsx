import { Component, CSSProperties, MouseEvent, createRef, RefObject } from 'react';
import styles from './follow-zone.css';

export class FollowZone extends Component {
  state = {
    height: 25,
    width: 25,
    top: 50,
    left: 50,
  };
  /** @type {RefObject<HTMLDivElement>} */
  root = createRef();

  render() {
    /** @type {CSSProperties} */
    const style = {
      top: `${this.state.top}%`,
      left: `${this.state.left}%`,
      height: `${this.state.height}%`,
      width: `${this.state.width}%`,
    };
    return (
      <div className={styles.followZone} style={style} ref={this.root} onMouseDown={this.onMoveStart}>
        Click here to follow John
        <div className={styles.resizeHandle} onMouseDown={this.onResizeStart} />
      </div>
    );
  }

  dragGrabLocation = {
    x: 0,
    y: 0,
    top: this.state.top,
    left: this.state.left,
  };

  /**
   * @param {MouseEvent<HTMLElement>} e
   */
  onMoveStart = (e) => {
    this.root.current.parentElement.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.endMove);
    this.dragGrabLocation = {
      x: e.clientX,
      y: e.clientY,
      top: this.state.top,
      left: this.state.left,
    };
  }

  /**
   * @param {MouseEvent<HTMLElement>} e
   */
  onDragMove = (e) => {
    const parentElement = this.root.current.parentElement;
    const parent = parentElement.getBoundingClientRect();
    const deltaX = e.clientX - this.dragGrabLocation.x;
    const deltaY = e.clientY - this.dragGrabLocation.y;
    const newLeft = Math.max(Math.min(95, deltaX / parent.width * 100 + this.dragGrabLocation.left), 0);
    const newTop = Math.max(Math.min(95, deltaY / parent.height * 100 + this.dragGrabLocation.top), 0);
    this.setState({
      top: newTop,
      left: newLeft,
    });
  }

  endMove = () => {
    this.root.current.parentElement.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.endMove);
  }

  /**
   * @param {MouseEvent<HTMLElement>} e
   */
  onResizeStart = (e) => {
    this.root.current.parentElement.addEventListener('mousemove', this.onDragResize);
    document.addEventListener('mouseup', this.endDrag);
    e.stopPropagation();
  }

  /**
   * @param {MouseEvent<HTMLElement>} e
   */
  onDragResize = (e) => {
    const parentElement = this.root.current.parentElement;
    const parent = parentElement.getBoundingClientRect();
    const domainX = e.clientX - parent.left;
    const domainY = e.clientY - parent.top;
    const newWidth = Math.max(Math.min(100, domainX / parent.width * 100 - this.state.left), 5);
    const newHeight = Math.max(Math.min(100, domainY / parent.height * 100 - this.state.top), 5);
    // console.log({ newWidth, newHeight });
    this.setState({
      height: newHeight,
      width: newWidth,
    });
  }

  endDrag = () => {
    this.root.current.parentElement.removeEventListener('mousemove', this.onDragResize);
    document.removeEventListener('mouseup', this.endDrag);
  }
}