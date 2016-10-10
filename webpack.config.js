const webpack = require('webpack');

module.exports = {
  entry: './app/App.js',
  output: {
    path: './',
    filename: 'index.js'
  },
  devServer: {
    inline: true,
    port: 3000
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.less$/,
        loader: 'style!css!less'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        CIRCLE_AUTH_TOKEN: JSON.stringify(process.env.CIRCLE_AUTH_TOKEN),
        CIRCLE_BUILD_BRANCH: JSON.stringify(process.env.CIRCLE_BUILD_BRANCH),
        CIRCLE_OWNER: JSON.stringify(process.env.CIRCLE_OWNER),
        CIRCLE_PROJECT_NAME: JSON.stringify(process.env.CIRCLE_PROJECT_NAME),
        GITHUB_AUTH_TOKEN: JSON.stringify(process.env.GITHUB_AUTH_TOKEN),
        GITHUB_OWNER: JSON.stringify(process.env.GITHUB_OWNER),
        GITHUB_PROJECT_NAMES: JSON.stringify(process.env.GITHUB_PROJECT_NAMES)
      }
    })
  ]
};
