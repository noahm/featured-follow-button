# Featured Follow Button

A simple extension for Twitch supporting video overlay and component mode!

Install it on your own channel here:
https://www.twitch.tv/ext/ih4ptg04wzw6nf4qms0612b8uj0tbh

## Frontend
### Local Dev
You will need your own extension on twitch in local dev mode.
Under Asset Hosting, configure the viewer path to `viewer.html`,
the config path to `config.html`, and the live config path
to `dashboard.html`.

```sh
cd frontend
npm install
npm start
```

### Publishing

```sh
cd frontend
npm install
npm run build
```

Upload the output zip file to twitch.
Tag with the version once released. `git tag v1.0.0 && git push --tags`

## Backend

Backend code deploys to Google App Engine via `gcloud app deploy` available [here](https://cloud.google.com/sdk/).
Stay tuned for conversion to Typescript, among other planned improvements.

## TODO

* determine state schema for multi-button
  * state as delivered to observers
    * array of buttons with x/y position, name, display name
  * state of channel options for broadcaster
    * X/Y position of each button "slot" + name
    * 
* update extension description to describe the different features between overlay and component modes

backend:
    update `GET /state/:channelID` to merge old `liveButton` into
    new `liveState` and return `LiveState`

viewer:
component mode:
    look for `layoutItems` info, if present, display first element
    of `layoutItems`, using `xReference` to determine alignment.
    otherwise use legacy behavior.
overlay mode:
    look for `layoutItems`, use legacy behavior if not present.
    if first element of `layoutItems` has no `yReference` property,
    display it alone using legacy behavior, but with `xReference`
    honored for left/right alignment. if first elem has `yReference`
    we assume this was built for overlay mode and display all
    according to layout specified per button.

config:
component mode:
    set left or right aligned
overlay mode:
    set left or right aligned
    enable/disable complex layout
    build layouts

live-config:
    save/load queue
component mode:
    legacy behavior with complex layout disabled
    upgraded layout activation with complex layout
