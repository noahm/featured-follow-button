# Featured Follow Button

A video overlay extension for Twitch!

Install it on your own channel here:
https://www.twitch.tv/ext/ih4ptg04wzw6nf4qms0612b8uj0tbh

This repo currently only contains the code for the front-end components.

### Build config TODO
 * !! Add HTTPS to dev server
 * Automate zip for submission
 * Include EBS code

## Local Dev
You will need your own extension on twitch in local dev mode.
Under Asset Hosting, configure the viewer path to `viewer.html`,
the config path to `config.html`, and the live config path
to `dashboard.html`.

```sh
cd frontend
npm install
npm start
```

## Publishing

```sh
cd frontend
npm install
npm run build
```

Zip up the contents of `frontend/dist` and submit to twitch.
Tag with the version once released. `git tag v1.0.0 && git push --tags`
