import "../common-styles.css";
import { hot } from "react-hot-loader/root";
import { applyThemeClass } from "../common-styles";
import { Component } from "react";
import { render } from "react-dom";
import { getAnchorMode } from "../utils";
import { ConfigProvider } from "../config";
import { SettingsPage } from "./settings-page";

class App extends Component {
  render() {
    switch (getAnchorMode()) {
      case "video_overlay":
        return (
          <SettingsPage
            title="Overlay Mode"
            description={`You have this extension activated as an overlay.
            (Overlay extensions only appear while you are live.)
        You can configure a custom layout below. Each button and zone acts as a
        "slot" that can be either filled or left unused and invisible during a
        stream. Don't forget to save when you're done editing!`}
          />
        );
      case "component":
      case "panel":
        return (
          <SettingsPage
            title="List Mode"
            description="You have this extension activated as a component or panel. In this
            mode the extension will display a list of channels a viewer can follow."
          />
        );
      default:
        return (
          <SettingsPage
            title="Activate me first!"
            description="You have yet to activate this extension anywhere. Activate it as
            a component for a list of channels to follow, or as an overlay to
            build a custom layout with buttons or transparent zones in specific
            locations over the video."
          />
        );
    }
  }
}

const HotApp = hot(() => (
  <ConfigProvider>
    <App />
  </ConfigProvider>
));

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(<HotApp />, appNode);
applyThemeClass();
