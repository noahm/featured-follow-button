import { useContext } from "react";
import { ConfigContext } from "../config";
import styles from "./dynamic-save-button.css";

export function DynamicSaveButton() {
  const { unpublished, saveAndPublish } = useContext(ConfigContext);
  if (!unpublished) {
    return null;
  }

  return (
    <button className={styles.button} onClick={saveAndPublish}>
      Save Changes
    </button>
  );
}
