const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './site/scripts/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
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
