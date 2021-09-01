// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const exec = require('child_process').exec;
const context = [__dirname];
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require("fs");


module.exports = {
    context: path.join.apply(null, context),
    entry: [
        './src/index'
    ],
    output: {
        path: path.join.apply(null, context.concat("dist")),
        filename: process.env.NODE_ENV === "production" ? '[name].colly.widget.js' : 'bundle1.js',
        publicPath: 'http://localhost:8081/'
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].colly.widget.[contenthash].css'
        }),
        new webpack.DefinePlugin({
            BUILD_ENV: JSON.stringify(process.env.NODE_ENV),
        }),
        new CleanWebpackPlugin(),
        {
            apply: (compiler) => { // replace style file from javascript bundle
                  if ( process.env.NODE_ENV === "production"  ) {
                      compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                          let fileContent  = fs.readFileSync("dist/main.colly.widget.js", "utf-8");
                          const startIndex = fileContent.indexOf("https://sdk.sariska.io/main.colly.widget");
                          const endIndex = startIndex + 65;
                          const selectedContent  = fileContent.slice(startIndex, endIndex);
                          const distDir = fs.readdirSync("dist");
                          const cssFile = distDir.find(item=>item.indexOf(".css") >=0);
                          fileContent = fileContent.replace(selectedContent, `https://sdk.sariska.io/${cssFile}`);
                          fs.writeFileSync("dist/main.colly.widget.js", fileContent);
                      });
                  }
            }
        }
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.marko'],
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.marko$/,
                loader: "@marko/webpack/loader"
            },
            {
                test: /\.scss$/,
                use: process.env.NODE_ENV === "production" ? [
                  MiniCssExtractPlugin.loader,
                 "css-loader",
                 "postcss-loader",
                  {
                      loader: "sass-loader", // compiles Sass to CSS
                      options: {
                          // Prefer Dart Sass
                          implementation: require('sass'),
                          sassOptions: {
                              includePaths: ['./node_modules']
                          }
                      }
                   }
                ] : [
                    {
                        loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader", // compiles Sass to CSS
                        options: {
                            // Prefer Dart Sass
                            webpackImporter: false,
                            implementation: require('sass'),
                            sassOptions: {
                                includePaths: ['./node_modules'],
                            }
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env'],
                },
            }
        ]
    },
    optimization: {
        usedExports: true
    },
    devtool: process.env.NODE_ENV === "production" ? false : 'eval-source-map',
    mode: process.env.NODE_ENV === "production" ? 'production' : 'development',
    devServer: {
        contentBase: './dist',
        port: 8081,
        hot: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    }
};
