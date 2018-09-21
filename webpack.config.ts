import * as CleanDistPlugin from 'clean-webpack-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as path from 'path'
import * as webpack from 'webpack'
import * as merge from 'webpack-merge'

const entryPath = path.join(__dirname, 'src/index.ts')
const outputPath = path.join(__dirname, 'dist')

// interface Config extends webpack.Configuration {
//   module: {
//     rules: webpack.RuleSetRule[],
//   }
// }

// determine build env
const TARGET_ENV = process.env.npm_lifecycle_event === 'build' ? 'production' : 'development'

// and output files based on build env
const outputFilename = TARGET_ENV === 'production' ? '[name].[hash].js' : '[name].js'
const vendorCSSName = TARGET_ENV === 'production' ? 'vendor.[contenthash].css' : 'vendor.css'

// common webpack config
const commonConfig: webpack.Configuration = {
  module: {
    noParse: /\.elm$/,
    rules: [
        {
        test: /\.(png|jpg)$/,
        use: 'url-loader?limit=25000',
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  output: {
    filename: outputFilename,
    path: outputPath,
    publicPath: TARGET_ENV === 'development' ? 'http://localhost:8080/' : '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'body',
      template: path.join('src', 'template.html'),
      title: 'Elm Webpack Starter',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', 'elm'],
  },
}

// additional webpack settings for local env (when invoked by 'npm start')
if (TARGET_ENV === 'development') {
  // tslint:disable-next-line:no-console
  console.log('Serving locally...')

  module.exports = merge(commonConfig, {
    devtool: 'eval-source-map',
    entry: [
      'webpack-dev-server/client?http://localhost:8080',
      entryPath,
    ],
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: 'style-loader!css-loader?sourceMap',
        },
        {
          test:   /\.(eot|ttf|woff|woff2|svg)(\?\S*)?$/,
          use: 'file-loader',
        },
      ],
    },
    // suppress perf hints in browser devtools
    performance: { hints: false },
  })
}

// additional webpack settings for prod env (when invoked via 'npm run build')
if (TARGET_ENV === 'production') {
  // tslint:disable-next-line:no-console
  console.log('Building for prod...')

  module.exports = merge(commonConfig, {
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(woff|woff2|ttf|eot)$/,
          use: 'url-loader?limit=50000',
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'all',
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
          },
        },
      },
    },
    plugins: [
      new CleanDistPlugin('dist', {
        root: __dirname,
      }),
    ],
  })
}