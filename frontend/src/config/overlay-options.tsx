import { useContext } from "react";
import { ConfigContext } from "../config";
import { FollowZone } from "../viewer/follow-zone";
import { FollowButton } from "../viewer/follow-button";
import { Auth } from "../auth";

export function OverlayOptions() {
  const { config, saveUserStyles } = useContext(ConfigContext);
  const {
    zoneBorder,
    zoneBorderRadius,
    zoneTextColor,
    dropShadow,
    hideText,
    customButtonStyle,
    buttonTemplate,
    buttonPadding,
    buttonShadowDirection,
    buttonShadowColor,
    buttonTextColor,
    buttonBaseColor,
    buttonBorderRadius
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
            Text color:{" "}
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
        <p>
          <label>
            <input
              type="checkbox"
              checked={!hideText}
              onChange={e => {
                saveUserStyles({ hideText: !e.currentTarget.checked });
              }}
            />{" "}
            Show text on hover
          </label>
        </p>
        <h3>Button Appearance</h3>
        <p>
          <label>
            <input
              type="checkbox"
              checked={customButtonStyle}
              onChange={e => {
                saveUserStyles({ customButtonStyle: e.currentTarget.checked });
              }}
            />{" "}
            Use custom button style
          </label>
        </p>
        <p>
          <label>
            Base Color:{" "}
            <input
              value={buttonBaseColor}
              onChange={e => {
                saveUserStyles({ buttonBaseColor: e.currentTarget.value });
              }}
              placeholder="#9147ff"
            />
          </label>
        </p>
        <p>
          <label>
            Text Color:{" "}
            <input
              value={buttonTextColor}
              onChange={e => {
                saveUserStyles({ buttonTextColor: e.currentTarget.value });
              }}
              placeholder="#ffffff"
            />
          </label>
        </p>
        <p>
          <label>
            Shadow Color:{" "}
            <input
              value={buttonShadowColor}
              onChange={e => {
                saveUserStyles({ buttonShadowColor: e.currentTarget.value });
              }}
              placeholder="#ffffff"
            />
          </label>
        </p>
        <p>
          <label>
            Shadow Direction:{" "}
            <select
              value={buttonShadowDirection}
              onChange={e => {
                saveUserStyles({
                  buttonShadowDirection: e.currentTarget.value as ""
                });
              }}
            >
              <option value="">None</option>
              <option value="NW">NW</option>
              <option value="NE">NE</option>
              <option value="SE">SE</option>
              <option value="SW">SW</option>
            </select>
          </label>
        </p>
        <p>
          <label title="Always use EM units!">
            Border Radius:{" "}
            <input
              value={buttonBorderRadius}
              onChange={e => {
                saveUserStyles({ buttonBorderRadius: e.currentTarget.value });
              }}
              placeholder="4px"
            />
          </label>
        </p>
        <p>
          <label title="Allows up to four values for each side, in clockwise order. Always use EM units!">
            Button Padding:{" "}
            <input
              value={buttonPadding}
              onChange={e => {
                saveUserStyles({ buttonPadding: e.currentTarget.value });
              }}
              placeholder="0.4em 0.7em"
            />
          </label>
        </p>
        <p>
          <label title="Available tokens are: HEART, CHANNEL_NAME, CHANNEL_LOGIN">
            Text Template:{" "}
            <input
              value={buttonTemplate}
              onChange={e => {
                saveUserStyles({ buttonTemplate: e.currentTarget.value });
              }}
              placeholder="HEART Follow CHANNEL_NAME"
            />
          </label>
        </p>
      </div>
      <div>
        <FollowZonePreview />
        <FollowButtonPreview />
      </div>
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

function FollowButtonPreview() {
  return (
    <div style={{ width: "10rem", margin: "2rem" }}>
      <FollowButton preview channelLogin="twitch" channelDisplayName="Twitch" />
    </div>
  );
}
