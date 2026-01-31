const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [
    "./example/App.jsx",
    "./example/app.css",
    "./styles/image-gallery.css",
  ],
  output: {
    path: path.resolve(__dirname, "example"),
    filename: "example.js",
    publicPath: "/dist/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    // In dev mode, CSS is loaded via style-loader, so we don't need to inject
    new webpack.DefinePlugin({
      __GALLERY_CSS__: JSON.stringify(""),
    }),
  ],
  devServer: {
    host: "0.0.0.0",
    port: 8001,
    open: true,
    historyApiFallback: {
      rewrites: [{ from: /\//, to: "/example/index.html" }],
    },
  },
};
