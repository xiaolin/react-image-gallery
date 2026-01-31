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
    extensions: [".js", ".jsx"],
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
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
    historyApiFallback: {
      rewrites: [{ from: /\//, to: "/example/index.html" }],
    },
  },
};
