/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
require('dotenv').config()
const path = require('path')
const webpack = require('webpack')

const isProduction = process.env.NODE_ENV === 'production'
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = () => {
  const localChainjsAliasProjectReferences = () => {
    if (process.env.use_local_chainjs_code_NOT_npm === 'true') {
      return true
    }
    return false
  }

  const baseConfig = {
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: 'ts-loader',
          options: {
            projectReferences: localChainjsAliasProjectReferences(),
            configFile: 'tsconfig-mjs-local.json',
          },
          exclude: ['/node_modules/'],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@open-rights-exchange/chain-js': path.resolve(__dirname, '../chain-js/dist/src'),
      },
    },
    plugins: [],
  }

  // const serverConfig = {
  //   target: 'node',
  //   output: {
  //     path: path.resolve(__dirname, 'dist'),
  //     filename: 'lib.node.js',
  //   },
  //   entry: baseConfig.entry,
  //   module: baseConfig.module,
  //   plugins: baseConfig.plugins,
  //   resolve: {
  //     extensions: baseConfig.resolve.extensions,
  //   },
  // }

  const clientConfig = {
    target: 'web', // <=== can be omitted as default is 'web'
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'chain-js-plugin-eos-umd.js',
      library: {
        name: 'chain_js_plugin_eos',
        type: 'umd',
      },
    },
    entry: baseConfig.entry,
    module: baseConfig.module,
    plugins: baseConfig.plugins,
    resolve: {
      extensions: baseConfig.resolve.extensions,
      fallback: {
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: false,
        util: false,
        assert: false,
      },
    },
    externals: {
      '@open-rights-exchange/chain-js': 'chain_js',
    },
  }

  const devProd = tempConfig => {
    if (isProduction) {
      tempConfig.mode = 'production'
    } else {
      tempConfig.mode = 'development'
      tempConfig.optimization = {
        usedExports: true,
        innerGraph: true,
        sideEffects: true,
      }
      tempConfig.devtool = false
      tempConfig.plugins = [new BundleAnalyzerPlugin({ analyzerPort: 5000 })]
    }
    return tempConfig
  }

  const finalClientConfig = devProd(clientConfig)

  // Add the buffer plugin when we're doing a UMD build.
  finalClientConfig.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  )

  finalClientConfig.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  )

  return finalClientConfig
}
