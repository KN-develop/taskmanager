/* eslint-disable */

const path = require(`path`);

module.exports = {
  entry: ['./src/main.js'],
  output: {
    filename: `./scripts/main.js`,
    path: path.join(__dirname, `public`),
  },
  devtool: `source-map`,
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: `babel-loader`,
        options: {
          presets: ["@babel/preset-env"],
          // plugins: ["@babel/transform-runtime"]
        },
      }
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, `public`),
    publicPath: 'http://localhost:8080/',
    hot: true,
    compress: true,
    writeToDisk: false
  }
};
