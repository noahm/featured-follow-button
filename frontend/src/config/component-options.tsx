import { Fragment, useContext, useState } from "react";
import { ConfigContext } from "../config";
import { FollowList } from "../viewer/follow-list";
import styles from "./component-options.css";

export function ComponentOptions() {
  const config = useContext(ConfigContext);
  const [header, updateHeader] = useState(
    config.config.liveState.componentHeader
  );
  const [timerHandle, updateTimer] = useState(0);

  return (
    <Fragment>
      <p>
        Used as a component, this extension will display a list of channels a
        viewer can click to follow. You may set a message to display above the
        list of buttons here:
      </p>
      <p>
        <label>
          Header:{" "}
          <input
            value={
              timerHandle ? header : config.config.liveState.componentHeader
            }
            onChange={e => {
              const newValue = e.currentTarget.value;
              clearTimeout(timerHandle);
              updateHeader(newValue);
              updateTimer(
                setTimeout(
                  (() => {
                    config.saveComponentHeader(newValue);
                    updateTimer(0);
                  }) as TimerHandler,
                  1000
                )
              );
            }}
          />
        </label>
      </p>
      <div className={styles.preview}>
        <FollowList isBroadcaster />
      </div>
    </Fragment>
  );
}
