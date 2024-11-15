const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { createBabelConfig } = require('./babel');

function getProductionConfig(fastpConfig) {
  const entry = fastpConfig.entry;
  const htmlPlugins = Object.keys(entry).map(name => {
    return new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), 'public/index.html'),
      filename: `${name}.html`,
      chunks: [name],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    });
  });

  return {
    mode: 'production',
    entry,
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      clean: true, // Clean the output directory before emit
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,  // 添加 ts 和 tsx 支持
          exclude: /node_modules/,
          use: {
            loader: require.resolve('babel-loader'),
            options: createBabelConfig()
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../../' // 调整CSS中资源的引用路径
              }
            },
            { 
              loader: require.resolve('css-loader'),
              options: {
                sourceMap: false,
                // 启用 CSS Modules (可选)
                // modules: {
                //   localIdentName: '[name]__[local]--[hash:base64:5]'
                // }
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024 // 10kb
            }
          }
        },
        // 添加字体文件处理
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash][ext]'
          }
        }
      ]
    },
    plugins: [
      ...htmlPlugins,
      // 确保React是全局可用的
      new webpack.ProvidePlugin({
        React: 'react'
      }),
      // 提取CSS到单独文件
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      }),
      // 定义环境变量
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.PUBLIC_URL': JSON.stringify('')
      }),
      // 确保chunk ID是确定性的
      new webpack.ids.DeterministicChunkIdsPlugin({
        maxLength: 5
      })
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true, // 移除console
              drop_debugger: true, // 移除debugger
              pure_funcs: ['console.log'] // 移除console.log
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          extractComments: false, // 不将注释提取到单独的文件
        }),
        new CssMinimizerPlugin() // 压缩CSS
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000, // 最小尺寸
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name(module) {
              // 获取包名
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              // 返回 vendor.[packageName]
              return `vendor.${packageName.replace('@', '')}`;
            },
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],  // 添加 .ts 和 .tsx 扩展名
      alias: {
        '@': path.resolve(process.cwd(), 'src'), // 支持 @ 导入
      }
    },
    performance: {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    stats: {
      children: false, // 不输出子模块的打包信息
      modules: false, // 不输出模块信息
      chunks: false, // 不输出chunk信息
      chunkModules: false // 不输出chunk所包含的模块信息
    }
  };
}

async function buildProduction(config) {
  console.log('Creating an optimized production build...');
  
  const webpackConfig = getProductionConfig(config);
  const compiler = webpack(webpackConfig);
  
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        reject(err);
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error('\nBuild failed with errors:\n');
        console.error(info.errors.join('\n\n'));
        reject(new Error('Build failed with errors.'));
        return;
      }

      if (stats.hasWarnings()) {
        console.warn('\nCompiled with warnings:\n');
        console.warn(info.warnings.join('\n\n'));
      }

      // 输出文件大小信息
      const buildFolder = path.relative(process.cwd(), webpackConfig.output.path);
      console.log('\nFile sizes after gzip:\n');
      
      const assets = info.assets
        .filter(asset => /\.(js|css)$/.test(asset.name))
        .map(asset => {
          const fileSize = (asset.size / 1024).toFixed(2) + ' KB';
          const gzipSize = (asset.size * 0.3 / 1024).toFixed(2) + ' KB'; // 估算gzip大小
          return {
            folder: path.join(buildFolder, asset.name),
            size: fileSize,
            gzipSize: gzipSize
          };
        });

      assets.forEach(asset => {
        console.log(
          `  ${asset.folder}
    Size: ${asset.size}
    Gzipped: ${asset.gzipSize}`
        );
      });

      compiler.close((closeErr) => {
        if (closeErr) {
          console.error('Compiler close error:', closeErr);
          reject(closeErr);
          return;
        }
        console.log('\n✨ Build completed successfully!\n');
        console.log(`The ${buildFolder} folder is ready to be deployed.`);
        console.log('You may serve it with a static server:\n');
        console.log('  npm install -g serve');
        console.log('  serve -s dist\n');
        resolve();
      });
    });
  });
}

module.exports = { buildProduction };