const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const { UglifyJsPlugin } = webpack.optimize;

const IS_PROD = (process.env.NODE_ENV === 'production');

exports = module.exports = {
  entry: './site/scripts/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    root: __dirname
  },
  module: {
    loaders: [
      {
        loader: 'babel',
        test: /\.js$/,
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
        test: /\.scss$/
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('main.css', {allChunks: true})
  ]
};

if (IS_PROD) {
  let { plugins } = exports;
  plugins.push(new UglifyJsPlugin());
}
