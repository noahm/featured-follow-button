import "../common-styles.css";
import { applyThemeClass } from "../common-styles";
import { Component } from "react";
import { render } from "react-dom";
import { LayoutEditor } from "./layout-editor";
import { ComponentOptions } from "./component-options";
import { getAnchorMode } from "../utils";
import { ConfigProvider, ConfigContext } from "../config";

class App extends Component {
  state = {
    anchor: getAnchorMode()
  };

  render() {
    switch (this.state.anchor) {
      case "video_overlay":
        return this.renderOverlay();
      case "component":
        return this.renderComponentMode();
      default:
        return this.unactivated();
    }
  }

  unactivated() {
    return (
      <div style={{ fontSize: "200%" }}>
        <div style={{ maxWidth: "37em" }}>
          <h2>Activate me first!</h2>
          <p>
            You have yet to activate this extension anywhere. Activate it as a
            component for a list of channels to follow, or as an overlay to
            build a custom layout with buttons or transparent zones in specific
            locations over the video.
          </p>
        </div>
      </div>
    );
  }

  renderOverlay() {
    return (
      <div style={{ fontSize: "200%" }}>
        <div style={{ maxWidth: "37em" }}>
          <h2>Overlay Builder</h2>
          <p>
            You have this extension activated as an overlay, so you can
            configure a custom layout below. Think of the buttons and zones as
            "slots" that can be filled or left unused and invisible during a
            stream. Don't forget to save when you're done editing!
          </p>
        </div>
        <ConfigContext.Consumer>
          {config => <LayoutEditor config={config} />}
        </ConfigContext.Consumer>
      </div>
    );
  }

  renderComponentMode() {
    return (
      <div style={{ fontSize: "200%" }}>
        <div style={{ maxWidth: "37em" }}>
          <h2>Component Mode</h2>
          <p>
            You have this extension activated as a component. In this mode, this
            extension will display a list of channels a viewer can follow.
          </p>
        </div>
        <ComponentOptions />
      </div>
    );
  }
}

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(
  <ConfigProvider>
    <App />
  </ConfigProvider>,
  appNode
);
applyThemeClass();