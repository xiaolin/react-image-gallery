const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");

const config = {
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
};

const jsEsOutput = Object.assign({}, config, {
  entry: ["./src/components/ImageGallery.tsx"],
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
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
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
    "react/jsx-runtime": "react/jsx-runtime",
    "react/jsx-dev-runtime": "react/jsx-dev-runtime",
  },
});

const jsOutput = Object.assign({}, config, {
  entry: ["./src/components/ImageGallery.tsx"],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "image-gallery.cjs",
    library: "ImageGallery",
    globalObject: "this",
    libraryTarget: "umd",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
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
    "react/jsx-runtime": {
      commonjs: "react/jsx-runtime",
      commonjs2: "react/jsx-runtime",
      amd: "react/jsx-runtime",
      root: "ReactJSXRuntime",
    },
    "react/jsx-dev-runtime": {
      commonjs: "react/jsx-dev-runtime",
      commonjs2: "react/jsx-dev-runtime",
      amd: "react/jsx-dev-runtime",
      root: "ReactJSXDevRuntime",
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
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
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
  entry: ["./styles/image-gallery.css", "./example/app.css"],
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
