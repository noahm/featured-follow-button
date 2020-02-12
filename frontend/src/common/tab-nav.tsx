import { useState } from "react";
import styles from "./tab-nav.css";

/**
 * Display label first
 * Selected value second
 */
type Tab<T extends string | number> = [string, T];

interface PublicProps<T extends string | number> {
  tabs: Array<Tab<T> | false>;
  activeTab: T;
  onTabChanged: (selected: T) => void;
}

export function TabNav<T extends string | number>(props: PublicProps<T>) {
  const tabs = props.tabs.filter((t): t is Tab<T> => !!t);

  return (
    <ul className={styles.tabList} role="tablist">
      {tabs.map(([label, value], key) => (
        <li
          key={key}
          className={value === props.activeTab ? styles.selected : undefined}
          aria-selected={value === props.activeTab}
          role="tab"
          onClick={() => props.onTabChanged(value)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
