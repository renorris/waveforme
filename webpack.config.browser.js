// Waveforme webpack.config.browser.js
// Copyright (C) 2023 Reese Norris - All Rights Reserved

const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

module.exports = (env) => {

    console.log('WEBPACK: BROWSER');

    const isLocal = env.IS_OFFLINE === 'true';
    console.log(`IS_OFFLINE = ${env.IS_OFFLINE}`);
    console.log(`isLocal = ${isLocal}`);

    return {
        mode: isLocal ? 'development' : 'production',
        devtool: isLocal ? 'cheap-module-source-map' : 'nosources-source-map',

        entry: path.join(__dirname, 'src/browser/index.tsx'),

        target: 'web',

        optimization: {
            minimize: false,
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'async',
                maxAsyncRequests: 30,
                maxSize: 5000000,
            },
        },

        devServer: {
            hot: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
            },
            watchFiles: {
                paths: ['**/*'],
                options: {
                    ignored: ["**/node_modules", "**/dist", "**/.webpack"],
                },
            },
            devMiddleware: {
                writeToDisk: true,
            },
        },

        plugins: [

            // Copy ./public to output dist
            new CopyWebpackPlugin({
                patterns: [
                    {
                        context: './public/',
                        from: '**/*',
                    },
                ],
            }),

            // Extract CSS plugin
            new MiniCssExtractPlugin({
                filename: isLocal ? '[name].css' : '[contenthash:8].css',
            }),

            // Copied from serverless boilerplate. Makes a nice stats.json that conforms to
            // our Stats type
            new StatsWriterPlugin({
                filename: "stats.json",
                transform(data, _opts) {
                    const assets = data.assetsByChunkName;
                    console.log(`assets = ${JSON.stringify(assets)}`);
                    const stats = JSON.stringify(
                        {
                            scripts: Object.entries(assets).flatMap(([_asset, files]) => {
                                return files.filter((filename) => filename.endsWith(".js") && !/\.hot-update\./.test(filename));
                            }),
                            styles: Object.entries(assets).flatMap(([_asset, files]) => {
                                return files.filter((filename) => filename.endsWith(".css") && !/\.hot-update\./.test(filename));
                            }),
                        },
                        null,
                        2,
                    );
                    return stats;
                },
            }),
        ],

        module: {
            rules: [
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
                    type: 'asset',
                },
            ],
        },

        resolve: {
            extensions: [".browser.tsx", ".browser.ts", ".browser.jsx", ".browser.js", ".tsx", ".ts", ".jsx", ".js"],
            fallback: {
                'fs': false,
                'path': false,
                'crypto': false,
            },
        },

        output: {
            path: path.join(__dirname, 'dist'),
            filename: isLocal ? '[name].js' : '[contenthash:8].js',
            crossOriginLoading: 'anonymous',
            clean: true,
        }
    }
}