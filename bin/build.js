#!/usr/bin/env node

const layouts = require('metalsmith-layouts');
const Metalsmith = require('metalsmith');
const path = require('path');

Metalsmith(path.resolve(__dirname, '../'))
  .source('site')
  .destination(path.resolve(__dirname, '../dist'))
  .use(layouts({
    engine: 'handlebars',
    default: 'main.hbs'
  }))
  .build((error) => {
    if (error) {
      throw error;
    }
    console.log('Build complete!');
  });
