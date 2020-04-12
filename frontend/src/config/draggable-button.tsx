import classNames from "classnames";
import {
  Component,
  MouseEvent as ReactMouseEvent,
  createRef,
  CSSProperties,
} from "react";
import styles from "./draggable-button.css";
import { PositionedButton } from "../models";
import { FollowButton } from "../viewer/follow-button";

interface Props {
  item: PositionedButton;
  identifier: string;
  defaultPosition: {
    top: number;
    left: number;
  };
  onChange: (item: PositionedButton) => void;
}

interface State {
  top: number;
  left: number;
  align: "right" | "left";
  dragging: boolean;
}

function clamp(lb: number, n: number, ub: number) {
  return Math.min(Math.max(lb, n), ub);
}

export class DraggableButton extends Component<Props, State> {
  private root = createRef<HTMLDivElement>();
  state: State = {
    top: this.props.defaultPosition ? this.props.defaultPosition.top : 25,
    left: this.props.defaultPosition ? this.props.defaultPosition.left : 25,
    align: this.props.item.align,
    dragging: false,
  };

  componentDidUpdate(pProps: Props, pState: State) {
    if (pState !== this.state && !this.state.dragging) {
      this.props.onChange({
        ...this.props.item,
        top: this.state.top,
        left: this.state.left,
        align: this.state.align,
      });
    }
  }

  render() {
    const style: CSSProperties = {
      top: `${this.state.top}%`,
    };
    if (this.state.align === "left") {
      style.left = `${this.state.left}%`;
    } else {
      style.right = `${100 - this.state.left}%`;
    }
    return (
      <div
        ref={this.root}
        className={classNames(styles.draggable, {
          [styles.dragging]: this.state.dragging,
          [styles.leftAligned]: this.state.align === "left",
          [styles.rightAligned]: this.state.align === "right",
        })}
        style={style}
        onMouseDown={this.onMouseDown}
        title="Right click to toggle L/R growth direction"
      >
        <FollowButton
          channelLogin={this.props.identifier.toLowerCase()}
          channelDisplayName={this.props.identifier}
          preview
        />
      </div>
    );
  }

  private dragGrabLocation = {
    x: 0,
    y: 0,
    top: this.state.top,
    left: this.state.left,
  };

  private onMouseDown = (e: ReactMouseEvent) => {
    switch (e.button) {
      case 0:
        break;
      case 2:
        this.toggleAlignment();
        return;
      default:
        return;
    }
    // allow button 1 to fall through
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

  private toggleAlignment = () => {
    const selfRect = this.root.current!.getBoundingClientRect();
    const parentRect = this.root.current!.parentElement!.getBoundingClientRect();
    const ownPercentage = (selfRect.width / parentRect.width) * 100;
    this.setState((s) => {
      return {
        align: s.align === "left" ? "right" : "left",
        left: s.left + ownPercentage * (s.align === "left" ? 1 : -1),
      };
    });
  };

  private onDragMove = (e: MouseEvent) => {
    const parentRect = this.root.current!.parentElement!.getBoundingClientRect();
    let deltaX = e.clientX - this.dragGrabLocation.x;
    const deltaY = e.clientY - this.dragGrabLocation.y;
    const newLeft = clamp(
      0,
      (deltaX / parentRect.width) * 100 + this.dragGrabLocation.left,
      100
    );
    const newTop = clamp(
      0,
      (deltaY / parentRect.height) * 100 + this.dragGrabLocation.top,
      95
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
}
