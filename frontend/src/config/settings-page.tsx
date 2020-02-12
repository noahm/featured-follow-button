import { ReactNode, useState, useContext } from "react";
import { LiveConfig } from "../config/live-config";
import { ConfigContext } from "../config";
import { LayoutEditor } from "./layout-editor";
import { getAnchorMode } from "../utils";
import { ComponentOptions } from "./component-options";
import { OverlayOptions } from "./overlay-options";
import styles from "./settings-page.css";
import { TabNav } from "../common/tab-nav";

const anchorMode = getAnchorMode();

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
  const enableTabs = anchorMode === "video_overlay";
  const [tab, setTab] = useState(
    enableTabs ? SettingsTab.LiveState : SettingsTab.Settings
  );
  const config = useContext(ConfigContext);

  let content: ReactNode;
  switch (tab) {
    case SettingsTab.LiveState:
      content = <LiveConfig config={config} />;
      break;
    case SettingsTab.Layout:
      content = <LayoutEditor config={config} />;
      break;
    case SettingsTab.Settings:
      if (anchorMode === "video_overlay") {
        content = <OverlayOptions />;
      } else {
        content = <ComponentOptions />;
      }
      break;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.maxWidth}>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        {enableTabs && (
          <TabNav
            tabs={[
              ["Live State", SettingsTab.LiveState],
              ["Layout", SettingsTab.Layout],
              ["Settings", SettingsTab.Settings]
            ]}
            activeTab={tab}
            onTabChanged={setTab}
          />
        )}
      </div>
      {!!anchorMode && content}
    </div>
  );
}
