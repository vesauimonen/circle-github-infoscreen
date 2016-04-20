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
        GITHUB_AUTH_TOKEN: JSON.stringify(process.env.GITHUB_AUTH_TOKEN),
        CIRCLECI_AUTH_TOKEN: JSON.stringify(process.env.CIRCLECI_AUTH_TOKEN)
      }
    })
  ]
};
