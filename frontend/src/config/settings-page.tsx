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
  OverlaySettings,
  ListSettings
}

interface Props {
  title: string;
  description: string;
}

export function SettingsPage(props: Props) {
  const isOverlay = anchorMode === "video_overlay";
  const [tab, setTab] = useState(
    isOverlay ? SettingsTab.LiveState : SettingsTab.ListSettings
  );
  const config = useContext(ConfigContext);

  let content: ReactNode;
  switch (tab) {
    case SettingsTab.LiveState:
      content = (
        <div className={styles.lessWidth}>
          <LiveConfig config={config} />
        </div>
      );
      break;
    case SettingsTab.Layout:
      content = <LayoutEditor config={config} />;
      break;
    case SettingsTab.OverlaySettings:
      content = <OverlayOptions />;
      break;
    case SettingsTab.ListSettings:
      content = <ComponentOptions disablePreviewEdits={isOverlay} />;
      break;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.maxWidth}>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        {isOverlay && (
          <TabNav
            tabs={[
              ["Live State", SettingsTab.LiveState],
              ["Layout", SettingsTab.Layout],
              ["Overlay Appearance", SettingsTab.OverlaySettings],
              ["Mobile Appearance", SettingsTab.ListSettings]
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
