#!/usr/bin/env node

const layouts = require('metalsmith-layouts');
const Metalsmith = require('metalsmith');
const path = require('path');
const watch = require('metalsmith-watch');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const WebpackDevServer = require('webpack-dev-server');

const DIST_DIR = path.resolve(__dirname, '../dist');
const IS_WATCH_ENABLED = process.argv[2] === '-w';
let devServer;

runMetalsmith()
  .then(runWebpack)
  .then(() => console.log('Build complete!'))
  .catch((error) => console.log('Build error: ', error));

function runMetalsmith() {
  return new Promise((resolve, reject) => {
    Metalsmith(path.resolve(__dirname, '../'))
      .source('site/pages')
      .destination(DIST_DIR)
      .use(layouts({
        engine: 'handlebars',
        default: 'main.hbs'
      }))
      .use(IS_WATCH_ENABLED ? watch() : metalsmithNoOp)
      .build((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
  });
}

function runWebpack() {
  let compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    if (IS_WATCH_ENABLED) {
      devServer = new WebpackDevServer(compiler, {
        contentBase: DIST_DIR
      });
      devServer.listen(8000, 'localhost');
      return resolve();
    }

    compiler.run((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function metalsmithNoOp(files, metalsmith, done) {
  done();
}
