const { resolve } = require('path');
const { readFileSync } = require('fs');

const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function readJson(file) {
  if (file in readJson.cache) {
    return readJson.cache[file];
  }
  let ret;
  try {
    ret = JSON.parse(readFileSync(file));
  } catch (e) {
    console.error('Couldn\'t read json file', { file });
  }
  return readJson.cache[file] = ret;
}
readJson.cache = {};

module.exports = function(env = {}, argv = {}) {
  const isProd = false;
  const serve = true;
  const pkg = readJson(resolve(__dirname, './package.json')) || {};

  return {
    devtool: isProd ? false : 'cheap-module-eval-source-map',
    devServer: !serve ? undefined : {
      contentBase: './dist',
    },
    entry: {
      config: './src/config/index.jsx',
      dashboard: './src/dashboard/index.jsx',
      viewer: './src/viewer/index.jsx',
    },
    output: {
      filename: '[name].bundle.js',
      path: resolve(__dirname, './dist'),
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'],
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader?cacheDirectory',
            options: {
              presets: [
                require('babel-preset-env'),
              ],
              plugins: [
                require('babel-plugin-transform-class-properties'),
                [require('babel-plugin-transform-react-jsx'), { pragma: 'h' }],
                [require('babel-plugin-jsx-pragmatic'), {
                  module: 'preact',
                  export: 'h',
                  import: 'h',
                }],
              ],
            },
          }
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]__[hash:base64:5]',
                  importLoaders: 1,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: [autoprefixer()],
                },
              },
            ],
          }),
        },
        {
          test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
          loader: 'file-loader',
        },
      ],
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': isProd ? 'production' : 'development',
      }),
      new ExtractTextPlugin({
        filename: '[name]-styles.css',
      }),
      new HtmlWebpackPlugin({
        title: `${pkg.description} - Dashboard Settings`,
        filename: 'dashboard.html',
        template: './src/template.html',
        chunks: ['dashboard'],
      }),
      new HtmlWebpackPlugin({
        title: `${pkg.description} - Viewer`,
        filename: 'viewer.html',
        template: './src/template.html',
        chunks: ['viewer'],
      }),
      new HtmlWebpackPlugin({
        title: `${pkg.description} - Config`,
        filename: 'config.html',
        template: './src/template.html',
        chunks: ['config'],
      }),
    ],
  };
};