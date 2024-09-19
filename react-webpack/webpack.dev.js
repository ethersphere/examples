const { merge } = require("webpack-merge");
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    hot: true,
    open: true,
  },
});
