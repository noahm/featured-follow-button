import { Fragment, useContext, useState, useRef } from "react";
import { ConfigContext } from "../config";
import { FollowList } from "../viewer/follow-list";
import styles from "./component-options.css";

export function ComponentOptions() {
  const { config, saveListOptions } = useContext(ConfigContext);
  const { title, showAvatars, showDescriptions } = config.liveState.listOptions;
  // const [title, saveLocalTitle] = useState(listOptions.title);
  // const [showAvatars, saveLocalAvatars] = useState(listOptions.showAvatars);
  // const [showDescriptions, saveLocalDescription] = useState(
  //   listOptions.showDescriptions
  // );
  // const localOptions = useRef<ListOptions>({
  //   title,
  //   showAvatars,
  //   showDescriptions
  // });
  // localOptions.current.title = title;
  // localOptions.current.showAvatars = showAvatars;
  // localOptions.current.showDescriptions = showDescriptions;

  return (
    <Fragment>
      <p>
        <label>
          Heading:{" "}
          <input
            value={title}
            onChange={e => {
              const newValue = e.currentTarget.value;
              saveListOptions({ title: newValue });
            }}
          />
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            checked={showAvatars}
            onChange={e => {
              const newValue = e.currentTarget.checked;
              saveListOptions({ showAvatars: newValue });
            }}
          />{" "}
          Show avatars
        </label>
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            checked={showDescriptions}
            onChange={e => {
              const newValue = e.currentTarget.checked;
              saveListOptions({ showDescriptions: newValue });
            }}
          />{" "}
          Show descriptions
        </label>
      </p>
      <h3>Live Preview</h3>
      <div className={styles.preview}>
        <FollowList />
      </div>
    </Fragment>
  );
}
