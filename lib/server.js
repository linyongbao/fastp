const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const open = require('open');
const { getBabelConfig } = require('./config');

function getWebpackConfig(fastpConfig) {
  const entry = fastpConfig.entry;
  const htmlPlugins = Object.keys(entry).map(name => {
    return new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), 'public/index.html'),
      filename: `${name}.html`,
      chunks: [name]
    });
  });

  return {
    mode: 'development',
    entry,
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,  // 添加 ts 和 tsx 支持
          exclude: /node_modules/,
          use: {
            loader: require.resolve('babel-loader'),
            options: getBabelConfig()
          }
        },
        {
          test: /\.css$/,
          use: [
            { loader: require.resolve('style-loader') },
            { loader: require.resolve('css-loader') }
          ]
        }
      ]
    },
    plugins: [
      ...htmlPlugins,
      new webpack.ProvidePlugin({
        React: 'react'
      })
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']  // 添加 .ts 和 .tsx 扩展名
    },
    resolveLoader: {
      modules: [
        // 先从项目的 node_modules 查找
        'node_modules',
        // 再从脚手架工具的 node_modules 查找
        path.resolve(__dirname, '../node_modules')
      ]
    },
    devtool: 'eval-source-map'
  };
}

async function startDevServer(config) {
  const webpackConfig = getWebpackConfig(config);
  const compiler = webpack(webpackConfig);
  
  const devServerConfig = {
    port: config.port || 3000,
    open: false,
    hot: true
  };

  const server = new WebpackDevServer(devServerConfig, compiler);
  
  await server.start();
  console.log(`Dev server running at http://localhost:${config.port}`);
  
  // 自动打开浏览器
  await open(`http://localhost:${config.port}/index.html`);
}

module.exports = { startDevServer };
