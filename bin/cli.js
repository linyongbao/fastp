#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const { startDevServer } = require('../lib/server');
const { loadConfig } = require('../lib/config');
const { createBabelConfig } = require('../lib/babel');
const { buildProduction } = require('../lib/build');


program
  .command('dev')
  .description('Start development server')
  .action(async () => {
    // 创建 .babelrc 配置文件
    await createBabelConfig();
    
    // 加载配置并启动服务器
    const config = await loadConfig();
    startDevServer(config);
  });

program
.command('build')
.description('Build for production')
.action(async () => {
  try {
    await createBabelConfig();
    const config = await loadConfig();
    await buildProduction(config);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
});

program.parse(process.argv);