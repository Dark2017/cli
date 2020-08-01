#!/usr/bin/env node
// commander.js，可以自动的解析命令和参数，用于处理用户输入的命令。
// download-git-repo，下载并提取 git 仓库，用于下载项目模板。
// Inquirer.js，通用的命令行用户界面集合，用于和用户进行交互。
// handlebars.js，模板引擎，将用户提交的信息动态填充到文件中。
// ora，下载过程久的话，可以用于显示下载中的动画效果。
// chalk，可以给终端的字体加上颜色。
// log-symbols，可以在终端上显示出 √ 或 × 等的图标。
const program = require('commander');
const inquirer = require('inquirer');
const symbols = require('log-symbols');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const chalk = require('chalk');
const ora = require('ora');
const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
/**
 * @description: program.version 调用该命令时（如 ljh-cli -v） 会携带出'1.0.0'
 * @description: program.command 定义初始化命令（如 ljh-cli init <项目名>）
 * @description: program.action action是执行command命令时发生的回调 
 * @param {type} node index.js init test == ljh-cli init ljh
 * @return: program.parse(process.argv)解析命令行中的参数，解析出name,并传入action回调。
 */
program.version('1.0.0', '-v, --version').
  command('init <name>').
  action(name => {
    console.log(name);
    // fs.existsSync 如果路径存在，则返回 true，否则返回 false
    if (!fs.existsSync(name)) {
      console.log('正在创建项目...');
      inquirer.prompt([
        {
          name: 'description',
          message: '请输入项目描述'
        },
        {
          name: 'author',
          message: '请输入作者名称'
        }
      ]).then(answers => {
        console.log(answers)
        //ora、chalk模块也进行了一些视觉美化
        const spinner = ora('正在下载模板...\n');
        spinner.start();
        // 可以使用download child_process
        let url = 'https://github.com/jefferyE/webpack-configuration-for-vue'
        url = 'http://172.16.0.251/fulipay/haolefu-ui-admin.git'
        child_process.exec('git clone ' + url, function (err, stdout, stderr) {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red('模板下载失败'))
          } else {
            spinner.succeed();
            // shell.mv(__dirname + '/webpack-configuration-for-vue', __dirname + '/' + name)
            shell.mv(__dirname + '/haolefu-ui-admin', __dirname + '/' + name)
            const filename = `${name}/package.json`;
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }
            if (fs.existsSync(filename)) {
              const content = fs.readFileSync(filename).toString();
              let dt = JSON.parse(content);
              dt.name = '{{name}}';
              dt.description = '{{description}}'
              const result = handlebars.compile(JSON.stringify(dt, null, 2))(meta);
              fs.writeFileSync(filename, result);
              console.log(symbols.success, chalk.green('项目初始化完成'));
            } else {
              console.log(symbols.error, chalk.red('package不存在'))
            }
          }
        })
      })
    } else {
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  })
program.parse(process.argv);

// 1、在用户输入答案之后，开始下载模板，这时候使用 ora 来提示用户正在下载中。
// 2、然后通过 chalk 来为打印信息加上样式，比如成功信息为绿色，失败信息为红色，这样子会让用户更加容易分辨，同时也让终端的显示更加的好看。
// 3、除了给打印信息加上颜色之外，还可以使用 log-symbols 在信息前面加上 √ 或 × 等的图标。