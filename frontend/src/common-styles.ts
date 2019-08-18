import commonStyles from "./common-styles.css";

/**
 * Call once at app start to apply the right theme classname to the html body tag
 */
export function applyThemeClass(force?: "dark" | "light") {
  if (force) {
    document.body.className = commonStyles[force];
    return;
  }

  if (typeof Twitch !== "undefined" && Twitch.ext) {
    Twitch.ext.onContext((context, changedProperties) => {
      if (changedProperties.indexOf("theme") >= 0) {
        document.body.className =
          context.theme === "dark" ? commonStyles.dark : commonStyles.light;
      }
    });
  }
}
