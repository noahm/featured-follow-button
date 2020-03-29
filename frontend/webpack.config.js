const { resolve } = require("path");
const { readFileSync } = require("fs");

const autoprefixer = require("autoprefixer");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ZipPlugin = require("zip-webpack-plugin");

function readJson(file) {
  if (file in readJson.cache) {
    return readJson.cache[file];
  }
  let ret;
  try {
    ret = JSON.parse(readFileSync(file));
  } catch (e) {
    console.error("Couldn't read json file", { file });
  }
  return (readJson.cache[file] = ret);
}
readJson.cache = {};

module.exports = function(env = {}) {
  const isProd = !env.dev;
  const serve = !!env.dev;
  const zip = !!env.zip;
  const pkg = readJson(resolve(__dirname, "./package.json")) || {};

  // Each of these folders under src/ will be an entry point
  const entryFolders = ["config", "viewer"];

  return {
    mode: "none",
    stats: "minimal",
    devtool: isProd ? false : "cheap-module-eval-source-map",
    devServer: !serve
      ? undefined
      : {
          contentBase: "./dist",
          https: true,
          port: 8080,
          public: "localhost:8080",
          allowedHosts: ["localhost.rig.twitch.tv", "localhost"]
        },
    entry: entryFolders.reduce((config, entry) => {
      const entryPoints = [
        "react-hot-loader/patch",
        `./src/${entry}/index.tsx`
      ];
      // if (env.dev) {
      //   entryPoints.unshift('react-devtools');
      // }
      config[entry] = entryPoints;
      return config;
    }, {}),
    output: {
      filename: "[name].bundle.js",
      path: resolve(__dirname, "./dist")
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".json"],
      alias: {
        "react-dom": "@hot-loader/react-dom"
      }
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader?cacheDirectory",
            options: {
              presets: [
                require("@babel/preset-env"),
                require("@babel/preset-typescript"),
                [
                  require("@babel/preset-react"),
                  {
                    pragma: "h"
                  }
                ]
              ],
              plugins: [
                [
                  require("@babel/plugin-proposal-class-properties"),
                  { loose: true }
                ],
                require("@babel/plugin-proposal-optional-chaining"),
                [
                  require("@emotion/babel-plugin-jsx-pragmatic"),
                  {
                    module: "react",
                    export: "createElement",
                    import: "h"
                  }
                ],
                "react-hot-loader/babel"
              ]
            }
          }
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[local]__[hash:base64:5]",
                importLoaders: 1
              }
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [autoprefixer()]
              }
            }
          ]
        },
        {
          test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
          loader: "file-loader",
          options: {
            esModule: false
          }
        }
      ]
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isProd ? "production" : "development"
        )
      }),
      new ForkTsCheckerWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name]-styles.css"
      }),
      ...entryFolders.map(
        entry =>
          new HtmlWebpackPlugin({
            title: `${pkg.description} - ${entry}`,
            filename: `${entry}.html`,
            template: "./src/template.html",
            chunks: [entry]
          })
      )
    ].concat(
      zip
        ? [
            new ZipPlugin({
              path: "../",
              filename: `${pkg.name}-${pkg.version}.zip`
            })
          ]
        : []
    )
  };
};
