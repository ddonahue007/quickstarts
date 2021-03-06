const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const BG_IMAGES_DIRNAME = 'bgimages';
const ASSET_PATH = process.env.ASSET_PATH || '/';
const { dependencies, federatedModuleName} = require("./package.json");
delete dependencies.serve; // Needed for nodeshift bug
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
module.exports = (env, argv, useContentHash) => {

  return {
    entry: path.resolve(__dirname, 'module', 'index.ts'),
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                // transpileOnly: true,
                // experimentalWatchApi: true,
                configFile: "tsconfig.module.json"
              }
            }
          ]
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(__dirname, 'node_modules/patternfly/dist/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/pficon')
          ],
          use: {
            loader: 'file-loader',
            options: {
              // Limit at 50k. larger files emited into separate files
              limit: 5000,
              outputPath: 'fonts',
              name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]',
            }
          }
        },
        {
          test: /\.svg$/,
          include: input => input.indexOf('background-filter.svg') > 1,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'svgs',
                name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]',
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: input => input.indexOf(BG_IMAGES_DIRNAME) > -1,
          use: {
            loader: 'svg-url-loader',
            options: {}
          }
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: input => (
            (input.indexOf(BG_IMAGES_DIRNAME) === -1) &&
            (input.indexOf('fonts') === -1) &&
            (input.indexOf('background-filter') === -1) &&
            (input.indexOf('pficon') === -1)
          ),
          use: {
            loader: 'raw-loader',
            options: {}
          }
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve(__dirname, 'module'),
            path.resolve(__dirname, 'node_modules/patternfly'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-catalog-view-extension/node_modules/@patternfly/react-styles/css/assets/images')
          ],
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'images',
                name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]',
              }
            }
          ]
        },
        {
          test: /\.(json)$/i,
          include: [
            path.resolve(__dirname, 'module/locales'),
          ],
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'locales',
                name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]',
              }
            }
          ]
        }
      ]
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
    //   new HtmlWebpackPlugin({
    //     template: path.resolve(__dirname, 'module', 'index.html')
    //   }),
      new Dotenv({
        systemvars: true,
        silent: true
      }),
    //   new CopyPlugin({
    //     patterns: [
    //       { from: './module/favicon.png', to: 'images' },
    //     ]
    //   }),
    //   new CopyPlugin({
    //     patterns: [
    //       { from: './module/locales', to: 'locales' },
    //     ]
    //   }),
    //   new webpack.container.ModuleFederationPlugin({
    //     name: federatedModuleName,
    //     filename: "remoteEntry.js",
    //     exposes: {
    //       "./QuickStartDrawer": "./module/app/QuickStartDrawerFederated",
    //       "./QuickStartCatalog": "./module/app/QuickStartCatalogFederated",
    //     },
    //     shared: {
    //       ...dependencies,
    //       react: {
    //         eager: true,
    //         singleton: true,
    //         requiredVersion: dependencies["react"],
    //       },
    //       "react-dom": {
    //         eager: true,
    //         singleton: true,
    //         requiredVersion: dependencies["react-dom"],
    //       },
    //     },
    //   })
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.module.json')
        })
      ],
      symlinks: false,
      cacheWithContext: false
    }
  }
};
