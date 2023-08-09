const path = require('path')
module.exports = {
  entry: path.resolve(__dirname, "index.js"),
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
  },
  node: {
    __dirname: false
  },
  plugins: [
    new CopyWebpackPlugin([
        'node_modules/swagger-ui-dist/swagger-ui.css',
        'node_modules/swagger-ui-dist/swagger-ui-bundle.js',
        'node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
        'node_modules/swagger-ui-dist/favicon-16x16.png',
        'node_modules/swagger-ui-dist/favicon-32x32.png'
    ])
  ]
}