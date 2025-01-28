const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");

const config = {
  mode: "production",
};

const jsEsOutput = Object.assign({}, config, {
  entry: ["./src/components/ImageGallery.jsx"],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "image-gallery.es.js",
    globalObject: "this",
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  externalsType: "module",
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
  },
});

const jsOutput = Object.assign({}, config, {
  entry: ["./src/components/ImageGallery.jsx"],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "image-gallery.umd.js",
    library: "ImageGallery",
    globalObject: "this",
    libraryTarget: "umd",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM",
    },
  },
});

const cssOutput = Object.assign({}, config, {
  entry: "./styles/scss/image-gallery.scss",
  output: {
    path: path.resolve(__dirname, "styles/css"),
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
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
    new RemovePlugin({
      /**
       * After compilation permanently remove empty JS files created from CSS entries.
       */
      after: {
        test: [
          {
            folder: "styles/css",
            method: (absoluteItemPath) => {
              return new RegExp(/\.js$/, "m").test(absoluteItemPath);
            },
          },
        ],
      },
    }),
  ],
});

const jsDemoOutput = Object.assign({}, config, {
  entry: ["./example/App.jsx"],
  output: {
    path: path.resolve(__dirname, "demo"),
    filename: "demo.mini.js",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [
    new RemovePlugin({
      /**
       * After compilation permanently remove unused LICENSE.txt file
       */
      after: {
        test: [
          {
            folder: "demo",
            method: (absoluteItemPath) => {
              return new RegExp(/\.txt$/).test(absoluteItemPath);
            },
          },
        ],
      },
    }),
  ],
});

const cssDemoOutput = Object.assign({}, config, {
  entry: ["./styles/scss/image-gallery.scss", "./example/App.css"],
  output: {
    path: path.resolve(__dirname, "demo"),
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
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
      filename: "demo.mini.css",
    }),
    new RemovePlugin({
      /**
       * After compilation permanently remove empty JS files created from CSS entries.
       */
      after: {
        test: [
          {
            folder: "demo",
            method: (absoluteItemPath) => {
              return new RegExp(/\.js$/).test(absoluteItemPath);
            },
          },
        ],
      },
    }),
  ],
});

module.exports = [jsEsOutput, jsOutput, cssOutput, jsDemoOutput, cssDemoOutput];
