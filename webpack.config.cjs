const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [
    "./example/App.jsx",
    "./example/App.css",
    "./styles/scss/image-gallery.scss",
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
        test: /\.(css|scss)$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "image-gallery.css",
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
