import { render } from "react-dom";
import { ConfigProvider, ConfigContext } from "../config";
import { applyThemeClass } from "../common-styles";
import { LiveConfig } from "./live-config";

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(
  <ConfigProvider>
    <ConfigContext.Consumer>
      {config => <LiveConfig config={config} />}
    </ConfigContext.Consumer>
  </ConfigProvider>,
  appNode
);
applyThemeClass();
