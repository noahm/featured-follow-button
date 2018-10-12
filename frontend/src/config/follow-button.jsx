import styles from './follow-button.css';

/**
 * 
 * @type {React.SFC}
 */
export const FollowButton = (props) => (
  <button className={styles.button}>
    <span className={styles.buttonText}>
      <svg width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px">
        <path clipRule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fillRule="evenodd" />
      </svg>
      Follow {props.children}
    </span>
  </button>
)
