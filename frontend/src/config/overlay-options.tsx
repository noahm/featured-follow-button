import * as cn from "classnames";
import { useContext, useState } from "react";
import { ConfigContext } from "../config";
import { FollowZone } from "../viewer/follow-zone";
import { FollowButton } from "../viewer/follow-button";
import styles from "./overlay-options.css";

export function OverlayOptions() {
  const { config, saveUserStyles } = useContext(ConfigContext);
  const {
    zoneBorderColor,
    zoneBorderStyle,
    zoneBorderWidth,
    zoneBorderRadius,
    zoneTextColor,
    zoneShadowStrength,
    zoneShadowColor,
    zoneTextHidden,
    customButtonStyle,
    buttonTemplate,
    buttonPadding,
    buttonShadowDirection,
    buttonShadowColor,
    buttonTextColor,
    buttonBaseColor,
    buttonBorderRadius,
  } = config.liveState.styles;

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div>
        <h3>Zone Appearance</h3>
        <p>
          Border style:{" "}
          <code>
            {zoneBorderWidth}px {zoneBorderStyle} {zoneBorderColor}
          </code>
          <br />
          <input
            value={zoneBorderWidth}
            type="range"
            onChange={(e) => {
              saveUserStyles({ zoneBorderWidth: +e.currentTarget.value });
            }}
            min="0"
            max="20"
          />{" "}
          <select
            value={zoneBorderStyle}
            onChange={(e) => {
              saveUserStyles({ zoneBorderStyle: e.currentTarget.value });
            }}
          >
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
            <option value="inset">inset</option>
            <option value="outset">outset</option>
          </select>{" "}
          <input
            value={zoneBorderColor}
            type="color"
            onChange={(e) => {
              saveUserStyles({ zoneBorderColor: e.currentTarget.value });
            }}
            placeholder="#778899"
          />
        </p>
        <p>
          <label>
            Border radius:
            <br />
            <input
              type="range"
              min="0"
              max="50"
              value={zoneBorderRadius.slice(0, -1)}
              onChange={(e) => {
                saveUserStyles({
                  zoneBorderRadius: `${e.currentTarget.value}%`,
                });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            Text color:{" "}
            <input
              type="color"
              value={zoneTextColor}
              onChange={(e) => {
                saveUserStyles({ zoneTextColor: e.currentTarget.value });
              }}
              placeholder="black"
            />
          </label>
        </p>
        <p>
          <label>
            Drop shadow:
            <br />
            <input
              type="range"
              value={zoneShadowStrength}
              min="0"
              max="20"
              onChange={(e) => {
                saveUserStyles({ zoneShadowStrength: +e.currentTarget.value });
              }}
            />{" "}
            <input
              type="color"
              value={zoneShadowColor}
              onChange={(e) => {
                saveUserStyles({ zoneShadowColor: e.currentTarget.value });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={!zoneTextHidden}
              onChange={(e) => {
                saveUserStyles({ zoneTextHidden: !e.currentTarget.checked });
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
              onChange={(e) => {
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
              type="color"
              value={buttonBaseColor}
              onChange={(e) => {
                saveUserStyles({ buttonBaseColor: e.currentTarget.value });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            Text Color:{" "}
            <input
              type="color"
              value={buttonTextColor}
              onChange={(e) => {
                saveUserStyles({ buttonTextColor: e.currentTarget.value });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            Shadow Color:{" "}
            <input
              type="color"
              value={buttonShadowColor}
              onChange={(e) => {
                saveUserStyles({ buttonShadowColor: e.currentTarget.value });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            Shadow Direction:{" "}
            <select
              value={buttonShadowDirection}
              onChange={(e) => {
                saveUserStyles({
                  buttonShadowDirection: e.currentTarget.value as "",
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
          <label>
            Border Radius:{" "}
            <input
              type="range"
              step="0.1"
              min="0"
              max="2"
              value={buttonBorderRadius.slice(0, -2)}
              onChange={(e) => {
                saveUserStyles({
                  buttonBorderRadius: `${e.currentTarget.value}em`,
                });
              }}
            />
          </label>
        </p>
        <p>
          <label title="Allows up to four values for each side, in clockwise order. Always use EM units!">
            Button Padding:{" "}
            <input
              value={buttonPadding}
              onChange={(e) => {
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
              onChange={(e) => {
                saveUserStyles({ buttonTemplate: e.currentTarget.value });
              }}
              placeholder="HEART Follow CHANNEL_NAME"
            />
          </label>
        </p>
      </div>
      <Previews />
    </div>
  );
}

function Previews() {
  const [bgClass, setBackgroundClass] = useState("custom");
  const [bgColor, setBgColor] = useState("#000000");
  return (
    <div className={styles.previews}>
      <label>
        Preview Background:{" "}
        <select
          value={bgClass}
          onChange={(e) => setBackgroundClass(e.currentTarget.value)}
        >
          <option value="custom">Solid</option>
          <option value="rainbow">Rainbow</option>
        </select>
      </label>{" "}
      <input
        style={{ visibility: bgClass === "custom" ? "visible" : "hidden" }}
        type="color"
        value={bgColor}
        onChange={(e) => setBgColor(e.currentTarget.value)}
      />
      <div
        style={{ backgroundColor: bgColor }}
        className={cn(styles.squarePreview, {
          [styles.rainbowBg]: bgClass === "rainbow",
        })}
      >
        <FollowZone
          disabled
          item={{
            channelName: "ChannelName",
            id: "",
            type: "zone",
            left: 10,
            top: 10,
            height: 80,
            width: 80,
          }}
        />
      </div>
      <div
        style={{ backgroundColor: bgColor }}
        className={cn(styles.squarePreview, styles.buttonPreview, {
          [styles.rainbowBg]: bgClass === "rainbow",
        })}
      >
        <FollowButton
          preview
          channelLogin="twitch"
          channelDisplayName="Twitch"
        />
      </div>
    </div>
  );
}
