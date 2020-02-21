import { Fragment, useContext } from "react";
import { ConfigContext } from "../config";
import { FollowZone } from "../viewer/follow-zone";

export function OverlayOptions() {
  const { config, saveUserStyles } = useContext(ConfigContext);
  const {
    zoneBorder,
    zoneBorderRadius,
    zoneTextColor,
    dropShadow
  } = config.liveState.styles;

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div>
        <h3>Zone Appearance</h3>
        <p>
          <label>
            Border style:{" "}
            <input
              value={zoneBorder}
              onChange={e => {
                saveUserStyles({ zoneBorder: e.currentTarget.value });
              }}
              placeholder="2px dashed lightslategray"
            />
          </label>
        </p>
        <p>
          <label>
            Border radius:{" "}
            <input
              value={zoneBorderRadius}
              onChange={e => {
                saveUserStyles({ zoneBorderRadius: e.currentTarget.value });
              }}
              placeholder="0px"
            />
          </label>
        </p>
        <p>
          <label>
            Text color{" "}
            <input
              value={zoneTextColor}
              onChange={e => {
                saveUserStyles({ zoneTextColor: e.currentTarget.value });
              }}
              placeholder="black"
            />
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={dropShadow}
              onChange={e => {
                saveUserStyles({ dropShadow: e.currentTarget.checked });
              }}
            />{" "}
            Drop shadow
          </label>
        </p>
      </div>
      <FollowZonePreview />
    </div>
  );
}

function FollowZonePreview() {
  return (
    <div
      style={{
        height: "10rem",
        width: "10rem",
        position: "relative",
        margin: "2rem"
      }}
    >
      <FollowZone
        disabled
        item={{
          channelName: "ChannelName",
          id: "",
          type: "zone",
          left: 0,
          top: 0,
          height: 100,
          width: 100
        }}
      />
    </div>
  );
}
