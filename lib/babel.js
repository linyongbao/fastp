const fs = require('fs').promises;
const path = require('path');
const babelConfig = {
  presets: [
    ["@babel/preset-env", {
      "targets": {
        "node": "current",
        "browsers": [
          "last 2 versions",
          "> 1%",
          "not dead"
        ]
      },
      "useBuiltIns": "usage",
      "corejs": 3
    }],
    ["@babel/preset-react", {
      "runtime": "automatic",
      "development": process.env.NODE_ENV === "development"
    }]
  ],
  plugins: [
      // 装饰器插件
    ["@babel/plugin-proposal-decorators", {
      "version": "2023-05"  // 使用最新的装饰器提案版本
    }],
    
    // 类属性转换插件
    ["@babel/plugin-transform-class-properties", {
      "loose": false
    }],
    
    // 运行时转换插件
    ["@babel/plugin-transform-runtime", {
      "corejs": 3,        // 使用 core-js v3 版本
      "helpers": true,    // 开启 helper 函数
      "regenerator": true // 支持 async/await
    }]
  ]
};
async function createBabelConfig() {


  const configPath = path.resolve(process.cwd(), '.babelrc');
  
  try {
    await fs.writeFile(configPath, JSON.stringify(babelConfig, null, 2));
    console.log('Created .babelrc file successfully');
  } catch (err) {
    console.error('Failed to create .babelrc:', err);
  }
}

module.exports = {babelConfig, createBabelConfig };