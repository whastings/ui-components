const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './site/scripts/main.js',
  output: {
    filename: 'dist/main.js'
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
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader', 'sass-loader'),
        test: /\.scss$/
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('./dist/main.css', {allChunks: true})
  ]
};
