import commonStyles from "./common-styles.css";

/**
 * Call once at app start to apply the right theme classname to the html body tag
 */
export function applyThemeClass(force?: "dark" | "light") {
  if (force) {
    document.body.className = `${document.body.className} ${commonStyles[force]}`;
    return;
  }

  if (typeof Twitch !== "undefined" && Twitch.ext) {
    Twitch.ext.onContext((context, changedProperties) => {
      if (changedProperties.indexOf("theme") >= 0) {
        const names = document.body.className.split(" ").filter((name) => {
          if (name === commonStyles.light && context.theme === "dark") {
            return false;
          }
          if (name === commonStyles.dark && context.theme !== "dark") {
            return false;
          }
          return true;
        });
        names.push(
          context.theme === "dark" ? commonStyles.dark : commonStyles.light
        );
        document.body.className = names.join(" ");
      }
    });
  }
}

/**
 * Call once to add the classname to set the transparent background color
 * for overlay mode
 */
export function setTransparentBg() {
  document.body.className = `${document.body.className} ${commonStyles.transparentBg}`;
}
