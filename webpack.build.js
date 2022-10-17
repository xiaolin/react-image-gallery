
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');

const config = {
  mode: 'production',
};

const jsOutput = Object.assign({}, config, {
  entry: [ './src/ImageGallery.js', ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'image-gallery.js',
    library: 'ImageGallery',
    globalObject: 'this',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src/'),
    },
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
  },
});

const cssOutput = Object.assign({}, config, {
  entry: './styles/scss/image-gallery.scss',
  output: {
    path: path.resolve(__dirname, 'styles/css'),
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'image-gallery.css',
    }),
    new RemovePlugin({
      /**
       * After compilation permanently remove empty JS files created from CSS entries.
       */
      after: {
        test: [
          {
            folder: 'styles/css',
            method: (absoluteItemPath) => {
              return new RegExp(/\.js$/, 'm').test(absoluteItemPath);
            },
          }
        ]
      }
    }),
  ],
});

module.exports = [jsOutput, cssOutput];
