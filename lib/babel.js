const fs = require('fs').promises;
const path = require('path');

async function createBabelConfig() {
  const babelConfig = {
    presets: [
      ["@babel/preset-env", { "targets": "defaults" }],
      ["@babel/preset-react", { "runtime": "automatic" }]
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ['@babel/plugin-transform-class-properties', { loose: true }] // 更新这行
    ]
  };

  const configPath = path.resolve(process.cwd(), '.babelrc');
  
  try {
    await fs.writeFile(configPath, JSON.stringify(babelConfig, null, 2));
    console.log('Created .babelrc file successfully');
  } catch (err) {
    console.error('Failed to create .babelrc:', err);
  }
}

module.exports = { createBabelConfig };