const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");
const webpack = require("webpack");

// Read CSS file and prepare for bundling
function getCSSContent() {
  try {
    const cssPath = path.resolve(__dirname, "styles/image-gallery.css");
    const css = fs.readFileSync(cssPath, "utf8");
    // Escape backticks and backslashes for template literal
    return css.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  } catch (e) {
    console.warn("Warning: Could not read CSS file for bundling:", e.message);
    return "";
  }
}

const config = {
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
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
  plugins: [
    new webpack.DefinePlugin({
      __GALLERY_CSS__: JSON.stringify(getCSSContent()),
    }),
  ],
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
  plugins: [
    new webpack.DefinePlugin({
      __GALLERY_CSS__: JSON.stringify(getCSSContent()),
    }),
  ],
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
  entry: "./styles/image-gallery.css",
  output: {
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "image-gallery.css",
    }),
    new RemovePlugin({
      after: {
        test: [
          {
            folder: "build",
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
  entry: ["./styles/image-gallery.css"],
  output: {
    path: path.resolve(__dirname, "demo"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "demo.mini.css",
    }),
    new RemovePlugin({
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
