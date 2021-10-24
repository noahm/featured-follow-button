# Featured Follow Button

A simple extension for Twitch supporting a full video overlay, or use as a component or panel!

Install it on your own channel here:
https://dashboard.twitch.tv/extensions/ih4ptg04wzw6nf4qms0612b8uj0tbh

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
Tag with the version once released. `git tag -a -m "v1.0.0" v1.0.0 && git push --tags`
