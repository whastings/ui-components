#!/usr/bin/env node

const layouts = require('metalsmith-layouts');
const Metalsmith = require('metalsmith');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

runMetalsmith()
  .then(runWebpack)
  .then(() => console.log('Build complete!'))
  .catch((error) => console.log('Build error: ', error));

function runMetalsmith() {
  return new Promise((resolve, reject) => {
    Metalsmith(path.resolve(__dirname, '../'))
      .source('site/pages')
      .destination(path.resolve(__dirname, '../dist'))
      .use(layouts({
        engine: 'handlebars',
        default: 'main.hbs'
      }))
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
    compiler.run((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
