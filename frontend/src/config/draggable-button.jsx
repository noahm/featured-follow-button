import classNames from 'classnames';
import { Component, MouseEvent, createRef } from 'react';
import styles from './draggable-button.css';

export class DraggableButton extends Component {
  root = createRef()
  state = {
    top: this.props.defaultPosition ? this.props.defaultPosition.top : 25,
    left: this.props.defaultPosition ? this.props.defaultPosition.left : 25,
    dragging: false,
  };

  componentDidUpdate(pProps, pState) {
    if (pState !== this.state && !this.state.dragging) {
      this.props.onChange({
        ...this.props.item,
        top: this.state.top,
        left: this.state.left,
      });
    }
  }

  render() {
    /** @type {CSSProperties} */
    const style = {
      top: `${this.state.top}%`,
      left: `${this.state.left}%`,
    };
    return (
      <button ref={this.root} className={classNames(styles.button, { [styles.dragging]: this.state.dragging })} style={style} onMouseDown={this.onMoveStart}>
        <span className={styles.buttonText}>
          <svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px">
            <path clipRule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fillRule="evenodd" />
          </svg>
          Follow {this.props.children}
        </span>
      </button>
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
    this.setState({ dragging: true });
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
    this.setState({ dragging: false });
  }
}
