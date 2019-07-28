import classNames from 'classnames';
import { Component, CSSProperties, createRef, MouseEvent as ReactMouseEvent } from 'react';
import styles from './follow-zone.css';
import { PositionedZone } from '../models';

interface Props {
  item: PositionedZone;
  defaultPosition: {
    top: number;
    left: number;
  };
  defaultSize: {
    height: number;
    width: number;
  };
  onChange: (item: PositionedZone) => void;
}

interface State {
  height: number;
  width: number;
  top: number;
  left: number;
  dragging: boolean;
}

export class FollowZone extends Component<Props, State> {
  state: State = {
    height: this.props.defaultSize ? this.props.defaultSize.height : 25,
    width: this.props.defaultSize ? this.props.defaultSize.width : 25,
    top: this.props.defaultPosition ? this.props.defaultPosition.top : 50,
    left: this.props.defaultPosition ? this.props.defaultPosition.left : 50,
    dragging: false,
  };
  root = createRef<HTMLDivElement>();

  componentDidUpdate(pProps: Props, pState: State) {
    if (pState !== this.state && !this.state.dragging) {
      this.props.onChange({
        ...this.props.item,
        height: this.state.height,
        width: this.state.width,
        top: this.state.top,
        left: this.state.left,
      });
    }
  }

  render() {
    const style: CSSProperties = {
      top: `${this.state.top}%`,
      left: `${this.state.left}%`,
      height: `${this.state.height}%`,
      width: `${this.state.width}%`,
    };
    return (
      <div className={classNames(styles.followZone, { [styles.dragging]: this.state.dragging })} style={style} ref={this.root} onMouseDown={this.onMoveStart}>
        Click to follow {this.props.children}
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

  onMoveStart = (e: ReactMouseEvent) => {
    this.root.current!.parentElement!.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.endMove);
    this.dragGrabLocation = {
      x: e.clientX,
      y: e.clientY,
      top: this.state.top,
      left: this.state.left,
    };
    this.setState({ dragging: true });
  }

  onDragMove = (e: MouseEvent) => {
    const parentElement = this.root.current!.parentElement!;
    const parent = parentElement.getBoundingClientRect();
    const deltaX = e.clientX - this.dragGrabLocation.x;
    const deltaY = e.clientY - this.dragGrabLocation.y;
    const newLeft = Math.max(Math.min(100 - this.state.width, deltaX / parent.width * 100 + this.dragGrabLocation.left), 0);
    const newTop = Math.max(Math.min(100 - this.state.height, deltaY / parent.height * 100 + this.dragGrabLocation.top), 0);
    this.setState({
      top: newTop,
      left: newLeft,
    });
  }

  endMove = () => {
    this.root.current!.parentElement!.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.endMove);
    this.setState({ dragging: false });
  }

  onResizeStart = (e: ReactMouseEvent) => {
    this.root.current!.parentElement!.addEventListener('mousemove', this.onDragResize);
    document.addEventListener('mouseup', this.endDrag);
    e.stopPropagation();
  }

  onDragResize = (e: MouseEvent) => {
    const parentElement = this.root.current!.parentElement!;
    const parent = parentElement.getBoundingClientRect();
    const domainX = e.clientX - parent.left;
    const domainY = e.clientY - parent.top;
    const newWidth = Math.max(Math.min(100 - this.state.left, domainX / parent.width * 100 - this.state.left), 5);
    const newHeight = Math.max(Math.min(100 - this.state.top, domainY / parent.height * 100 - this.state.top), 5);
    // console.log({ newWidth, newHeight });
    this.setState({
      height: newHeight,
      width: newWidth,
    });
  }

  endDrag = () => {
    this.root.current!.parentElement!.removeEventListener('mousemove', this.onDragResize);
    document.removeEventListener('mouseup', this.endDrag);
  }
}
