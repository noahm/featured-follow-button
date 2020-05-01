import * as cn from "classnames";
import { useContext, useState, Fragment } from "react";
import { ConfigContext } from "../config";
import { FollowZone } from "../viewer/follow-zone";
import { FollowButton } from "../viewer/follow-button";
import styles from "./overlay-options.css";
import { ButtonPaddingControl } from "./button-padding";

const fontLibrary: Record<string, string> = {
  Roobert: "Roobert, Helvetica Neue, Helvetica, Arial, sans-serif",
  Georgia: "Georgia, serif",
  Arial: "Arial, Helvetica, sans-serif",
  "Comic Sans": '"Comic Sans MS", cursive, sans-serif',
  Console: "Consolas, Courier, monospace",
  Impact: "Impact, Charcoal, sans-serif",
  Lucida: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  Palatino: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  Tahoma: "Tahoma, Geneva, sans-serif",
  Times: '"Times New Roman", Times, serif',
  Trebuchet: '"Trebuchet MS", Helvetica, sans-serif',
  Verdanda: "Verdanda, Geneva, sans-serif",
};

export function OverlayOptions() {
  const { config, saveUserStyles, resetUserStyles } = useContext(ConfigContext);
  const {
    fontFamily,
    zoneBorderColor,
    zoneBorderStyle,
    zoneBorderWidth,
    zoneBorderRadius,
    zoneBorderVisible,
    zoneTextColor,
    zoneTextWeight,
    zoneTextSize,
    zoneTextAlign,
    zoneShadowStrength,
    zoneShadowColor,
    zoneTextVisible,
    buttonTemplate,
    buttonPadding,
    buttonTextSize,
    buttonShadowDirection,
    buttonShadowColor,
    buttonTextColor,
    buttonBaseColor,
    buttonBorderRadius,
  } = config.liveState.styles;

  return (
    <div className={styles.options}>
      <div>
        <h3>General</h3>
        <p>
          <label>
            Font:{" "}
            <select
              value={fontFamily}
              onChange={(e) => {
                saveUserStyles({ fontFamily: e.currentTarget.value });
              }}
            >
              {Object.keys(fontLibrary).map((name) => (
                <option
                  key={name}
                  style={{ fontFamily: fontLibrary[name] }}
                  value={fontLibrary[name]}
                >
                  {name}
                </option>
              ))}
            </select>
          </label>
        </p>
        <p>
          <button onClick={resetUserStyles}>Reset all to defaults</button>
        </p>
        <h3>Zone Appearance</h3>
        <p>
          <label>
            Show border:{" "}
            <select
              value={zoneBorderVisible}
              onChange={(e) => {
                saveUserStyles({
                  zoneBorderVisible: e.currentTarget
                    .value as typeof zoneTextVisible,
                });
              }}
            >
              <option value="always">Always</option>
              <option value="hover">On Hover</option>
              <option value="never">Never</option>
            </select>
          </label>
        </p>
        <p>
          Border style: <br />
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
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="inset">Inset</option>
            <option value="outset">Outset</option>
          </select>{" "}
          <input
            value={zoneBorderColor}
            type="color"
            onChange={(e) => {
              saveUserStyles({ zoneBorderColor: e.currentTarget.value });
            }}
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
        <h4>Zone Text</h4>
        <p>
          <label>
            Show text:{" "}
            <select
              value={zoneTextVisible}
              onChange={(e) => {
                saveUserStyles({
                  zoneTextVisible: e.currentTarget
                    .value as typeof zoneTextVisible,
                });
              }}
            >
              <option value="always">Always</option>
              <option value="hover">On Hover</option>
              <option value="never">Never</option>
            </select>
          </label>
        </p>
        {zoneTextVisible !== "never" && (
          <Fragment>
            <p>
              <label>
                Text color:{" "}
                <input
                  type="color"
                  value={zoneTextColor}
                  onChange={(e) => {
                    saveUserStyles({ zoneTextColor: e.currentTarget.value });
                  }}
                />
              </label>
            </p>
            <p>
              <label>
                Text size:{" "}
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={zoneTextSize}
                  onChange={(e) => {
                    saveUserStyles({ zoneTextSize: +e.currentTarget.value });
                  }}
                />
                %
              </label>
            </p>
            <p>
              <label>
                Text weight:{" "}
                <select
                  value={zoneTextWeight}
                  onChange={(e) => {
                    saveUserStyles({ zoneTextWeight: e.currentTarget.value });
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </label>
            </p>
            <p>
              <label>
                Text alignment:{" "}
                <select
                  value={zoneTextAlign}
                  onChange={(e) => {
                    saveUserStyles({
                      zoneTextAlign: e.currentTarget
                        .value as typeof zoneTextAlign,
                    });
                  }}
                >
                  <option value="C">Center</option>
                  <option value="NW">NW</option>
                  <option value="N">N</option>
                  <option value="NE">NE</option>
                  <option value="E">E</option>
                  <option value="SE">SE</option>
                  <option value="S">S</option>
                  <option value="SW">SW</option>
                  <option value="W">W</option>
                </select>
              </label>
            </p>
          </Fragment>
        )}

        <h3>Button Appearance</h3>
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
            Text size:{" "}
            <input
              type="number"
              min="0"
              max="1000"
              value={buttonTextSize}
              onChange={(e) => {
                saveUserStyles({ buttonTextSize: +e.currentTarget.value });
              }}
            />
            %
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
            Border Radius:
            <br />
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
          <label>Button Padding:</label>
        </p>
        <ButtonPaddingControl
          value={buttonPadding}
          onChange={(newValue) => {
            saveUserStyles({ buttonPadding: newValue });
          }}
        />
        <p>
          <label>
            Text Template: <br />
            <input
              size={40}
              value={buttonTemplate}
              onChange={(e) => {
                saveUserStyles({ buttonTemplate: e.currentTarget.value });
              }}
            />
          </label>
          <br />
          <code>HEART</code>, <code>CHANNEL_NAME</code>, and{" "}
          <code>CHANNEL_LOGIN</code> are special values.
        </p>
        <p>Try combinations like:</p>
        <ul>
          <li>HEART Follow CHANNEL_NAME</li>
          <li>follow /CHANNEL_LOGIN</li>
        </ul>
      </div>
      <Previews fontFamily={fontFamily} />
    </div>
  );
}

function Previews({ fontFamily }: { fontFamily: string }) {
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
        style={{ backgroundColor: bgColor, fontFamily }}
        className={cn(styles.squarePreview, {
          [styles.rainbowBg]: bgClass === "rainbow",
        })}
      >
        <FollowZone
          disabled
          item={{
            channelName: "Twitch",
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
        style={{ backgroundColor: bgColor, fontFamily }}
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
