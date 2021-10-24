# v2.4.3

- Updated calls to the new Twitch API to use the latest authorization methods

# v2.4.2

- Fixed a bug that could cause the extension to completely blank out the video player

# v2.4.1

- Fixed parsing and display of button template string

# v2.4.0

- Consolidated two config screens down to a single tabbed interface available both from live dashboard and extensions settings.
- Added options to display avatars and channel descriptions in list mode (component, panel, and mobile views).
- Automatically uses current live stream thumbnail as background of layout editor when you are live.
- Added new option providing manual control over L/R alignment of buttons in an overlay layout.
- Added tons of options to control visual style of follow zones and buttons.
- Changed default font to match the rest of twitch.

# v2.3.1

- Fixed tracking calls enum definitions.
- Stopped disabling follow buttons while twitch UI is open as its state cannot be reliably tracked.

# v2.3.0

- Added tracking calls using new twitch extension tracking methods.

# v2.2.1

- Updated colors to match new site design.
- Fixed a bug causing follow zones to do nothing when clicked.
- Fixed a bug causing the mobile view to not be used when activated as an overlay.

# v2.2.0

- Added new list-style display, used for new docked component design, new panel type, and as a new mobile view.
- List style display allows edits from any place the extension is visible: config page, dashboard, or channel page.
- When mounted as a component or panel simply provides a list of channels to follow that can be added or removed in realtime.
- When mounted as a video overlay, all old behavior remains including custom layouts with buttons and zones.
