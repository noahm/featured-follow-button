import { ReactNode, useState, useContext } from "react";
import { LiveConfig } from "../config/live-config";
import { ConfigContext } from "../config";
import { LayoutEditor } from "./layout-editor";
import { getAnchorMode } from "../utils";
import { ComponentOptions } from "./component-options";
import { OverlayOptions } from "./overlay-options";
import styles from "./settings-page.css";

enum SettingsTab {
  LiveState,
  Layout,
  Settings
}

interface Props {
  title: string;
  description: string;
}

export function SettingsPage(props: Props) {
  const [tab, setTab] = useState(SettingsTab.LiveState);
  const config = useContext(ConfigContext);
  const anchorMode = getAnchorMode();
  const enableTabs = !!anchorMode;

  let content: ReactNode;
  switch (tab) {
    case SettingsTab.Settings:
      if (anchorMode === "video_overlay") {
        content = <OverlayOptions />;
      } else {
        content = <ComponentOptions />;
      }
      break;
    case SettingsTab.Layout:
      content = <LayoutEditor config={config} />;
      break;
    case SettingsTab.LiveState:
      content = <LiveConfig config={config} />;
      break;
  }

  return (
    <div className={styles.settingsPage} style={{ fontSize: "140%" }}>
      <div style={{ maxWidth: "50em" }}>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        {enableTabs && (
          <ul>
            <li>
              <a onClick={() => setTab(SettingsTab.LiveState)}>Live State</a>
            </li>
            {anchorMode === "video_overlay" && (
              <li>
                <a onClick={() => setTab(SettingsTab.Layout)}>Layout</a>
              </li>
            )}
            <li>
              <a onClick={() => setTab(SettingsTab.Settings)}>Settings</a>
            </li>
          </ul>
        )}
      </div>
      {enableTabs && content}
    </div>
  );
}
