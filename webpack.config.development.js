const { merge } = require('webpack-merge')
const path = require('path')

const config = require('./webpack.config')

module.exports = merge(config, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    open: {
      app: {
        name: 'Google Chrome'
      }
    },
    port: 8000,
    proxy: {
      '/**': 'http://localhost:3000'
    }
  }
})
