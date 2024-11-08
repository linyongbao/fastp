const path = require('path');
const fs = require('fs').promises;

const getBabelConfig = () => ({
  presets: [
    ["@babel/preset-env", { "targets": "defaults" }],
    ["@babel/preset-react", { "runtime": "automatic" }]
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ['@babel/plugin-transform-class-properties', { loose: true }] // 更新这行
  ]
});

async function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'fastp.config.js');
  try {
    const config = require(configPath);
    return {
      entry: config.entry || { index: './src/index.js' },
      port: config.port || 3000,
      ...config
    };
  } catch (err) {
    console.error('Failed to load fastp.config.js, using default config');
    return {
      entry: { index: './src/index.js' },
      port: 3000
    };
  }
}

module.exports = { loadConfig, getBabelConfig };