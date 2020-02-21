import { Fragment, useContext } from "react";
import { ConfigContext } from "../config";
import { FollowList } from "../viewer/follow-list";
import styles from "./component-options.css";

interface Props {
  disablePreviewEdits?: boolean;
}

export function ComponentOptions(props: Props) {
  const { config, saveListOptions } = useContext(ConfigContext);
  const { title, showAvatars, showDescriptions } = config.liveState.listOptions;

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
        <FollowList disableEdits={props.disablePreviewEdits} />
      </div>
    </Fragment>
  );
}
