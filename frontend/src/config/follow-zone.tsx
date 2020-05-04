import cn from "classnames";
import { Component, createRef, MouseEvent as ReactMouseEvent } from "react";
import styles from "./follow-zone.css";
import { PositionedZone, UserStyles } from "../models";
import { clamp, getZoneStyles } from "../utils";

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
  styles: UserStyles;
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
  private root = createRef<HTMLDivElement>();

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
    const style = getZoneStyles(this.state, this.props.styles);
    return (
      <div
        className={cn(styles.followZone, {
          [styles.dragging]: this.state.dragging,
        })}
        style={style}
        ref={this.root}
        onMouseDown={this.onMoveStart}
      >
        <span style={{ opacity: 0.9 }}>zone {this.props.children}</span>
        <div
          className={cn(styles.resizeHandle, styles.se)}
          data-dir="se"
          onMouseDown={this.onResizeStart}
        />
        <div
          className={cn(styles.resizeHandle, styles.sw)}
          data-dir="sw"
          onMouseDown={this.onResizeStart}
        />
        <div
          className={cn(styles.resizeHandle, styles.ne)}
          data-dir="ne"
          onMouseDown={this.onResizeStart}
        />
        <div
          className={cn(styles.resizeHandle, styles.nw)}
          data-dir="nw"
          onMouseDown={this.onResizeStart}
        />
      </div>
    );
  }

  private dragGrabLocation = {
    /**
     * x position within the button the cursor grabbed at
     */
    x: 0,
    /**
     * y position within the button the cursor grabbed at
     */
    y: 0,
    top: this.state.top,
    left: this.state.left,
  };

  private onMoveStart = (e: ReactMouseEvent) => {
    this.root.current!.parentElement!.addEventListener(
      "mousemove",
      this.onDragMove
    );
    document.addEventListener("mouseup", this.endMove);
    this.dragGrabLocation = {
      x: e.clientX,
      y: e.clientY,
      top: this.state.top,
      left: this.state.left,
    };
    this.setState({ dragging: true });
  };

  private onDragMove = (e: MouseEvent) => {
    const parentElement = this.root.current!.parentElement!;
    const parent = parentElement.getBoundingClientRect();
    const deltaX = e.clientX - this.dragGrabLocation.x;
    const deltaY = e.clientY - this.dragGrabLocation.y;
    const newLeft = clamp(
      0,
      (deltaX / parent.width) * 100 + this.dragGrabLocation.left,
      100 - this.state.width
    );
    const newTop = clamp(
      0,
      (deltaY / parent.height) * 100 + this.dragGrabLocation.top,
      100 - this.state.height
    );
    this.setState({
      top: newTop,
      left: newLeft,
    });
  };

  private endMove = () => {
    this.root.current!.parentElement!.removeEventListener(
      "mousemove",
      this.onDragMove
    );
    document.removeEventListener("mouseup", this.endMove);
    this.setState({ dragging: false });
  };

  onResizeStart = (e: ReactMouseEvent<HTMLDivElement>) => {
    const dir = e.currentTarget.dataset["dir"]!;
    const xIsWidth = !!dir.match(/e/);
    const yIsHeight = !!dir.match(/s/);
    const boundResizeHandler = this.onDragResize.bind(
      this,
      xIsWidth,
      yIsHeight
    );
    const parent = this.root.current!.parentElement!;
    parent.addEventListener("mousemove", boundResizeHandler);
    function endResize() {
      parent.removeEventListener("mousemove", boundResizeHandler);
      document.removeEventListener("mouseup", endResize);
    }
    document.addEventListener("mouseup", endResize);
    e.stopPropagation();
  };

  private onDragResize = (
    xIsWidth: boolean,
    yIsHeight: boolean,
    e: MouseEvent
  ) => {
    const parentElement = this.root.current!.parentElement!;
    const parent = parentElement.getBoundingClientRect();
    // position of cursor, in px, within the layout bounding box
    const domainX = e.clientX - parent.left;
    const domainY = e.clientY - parent.top;
    // position of cursor in percentage from top left corner of bounding box
    const pctX = (domainX / parent.width) * 100;
    const pctY = (domainY / parent.height) * 100;

    const newX = clamp(
      5,
      xIsWidth ? pctX - this.state.left : pctX,
      xIsWidth ? 100 - this.state.left : this.state.width + this.state.left
    );
    const newY = clamp(
      5,
      yIsHeight ? pctY - this.state.top : pctY,
      yIsHeight ? 100 - this.state.top : this.state.height + this.state.top
    );

    const newState: Partial<State> = {};
    newState[yIsHeight ? "height" : "top"] = newY;
    if (yIsHeight) {
      newState.height = newY;
    } else {
      newState.top = newY;
      newState.height = clamp(
        0,
        this.state.height - (newY - this.state.top),
        100 - newY
      );
    }
    if (xIsWidth) {
      newState.width = newX;
    } else {
      newState.left = newX;
      newState.width = clamp(
        0,
        this.state.width - (newX - this.state.left),
        100 - newX
      );
    }
    // @ts-ignore
    this.setState(newState);
  };
}
