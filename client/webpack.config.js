const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    filename: "index.bundle.js",
    path: path.join(__dirname, 'dist')

  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,

        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    roots: [__dirname, path.join(__dirname, 'src')],
    extensions: ['.js', '.jsx'],
    fallback: {
      assert: require.resolve('assert'),
      path: require.resolve('path-browserify'),
    }
  },
  devServer: {
    port: 3000,

    liveReload: true,
  },
  plugins: [new HtmlWebpackPlugin({ template: '/index.html' })],

}