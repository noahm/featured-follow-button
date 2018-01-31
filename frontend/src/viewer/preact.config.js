export default (config, env, helpers) => {
    if (env.production) {
        [
            'UglifyJsPlugin',
            'PushManifestPlugin',
            // 'CopyWebpackPlugin',
            'SWPrecacheWebpackPlugin',
        ].forEach(pluginName => {
            const { index } = helpers.getPluginsByName(config, pluginName)[0];
            let del = 1;
            if (pluginName === 'PushManifestPlugin') {
                del = 2;
            }
            config.plugins.splice(index, del);
        });

        // helpers.getPluginsByName(config, 'LoaderOptionsPlugin')[0].plugin.options.minimize = false;
        // console.log(config.)

        config.devtool = false;
    }
}
