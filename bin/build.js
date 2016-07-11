#!/usr/bin/env node

const cp = require('cp');
const layouts = require('metalsmith-layouts');
const Metalsmith = require('metalsmith');
const msIf = require('metalsmith-if');
const path = require('path');
const permalinks = require('metalsmith-permalinks');
const watch = require('metalsmith-watch');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const WebpackDevServer = require('webpack-dev-server');

const DIST_DIR = path.resolve(__dirname, '../dist');
const IS_PROD = (process.env.NODE_ENV === 'production');
const IS_WATCH_ENABLED = process.argv[2] === '-w';
const NODE_MODULES = path.resolve(__dirname, '../node_modules');
let devServer;

runMetalsmith()
  .then(runWebpack)
  .then(copyDeps)
  .then(() => console.log('Build complete!'))
  .catch((error) => console.log('Build error: ', error));

function runMetalsmith() {
  return new Promise((resolve, reject) => {
    Metalsmith(path.resolve(__dirname, '../'))
      .source('site/pages')
      .destination(DIST_DIR)
      .use(layouts({
        engine: 'handlebars',
        default: 'main.hbs',
        IS_PROD
      }))
      .use(permalinks({
        pattern: ':title',
        relative: false
      }))
      .use(msIf(IS_WATCH_ENABLED, watch()))
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

function copyDeps() {
  let drePath = path.join(
    NODE_MODULES,
    'document-register-element/build/document-register-element.js'
  );
  cp.sync(drePath, path.join(DIST_DIR, 'document-register-element.js'));
}
