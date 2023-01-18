// Waveforme webpack.config.browser.js
// Copyright (C) 2023 Reese Norris - All Rights Reserved

const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

const isDevelopment = process.env.IS_DEVELOPMENT;

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    devtool: 'cheap-module-source-map',

    entry: path.join(__dirname, 'src/browser/index.tsx'),

    target: 'web',

    devServer: {
        hot: true,
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

        // Copied from serverless boilerplate. Makes a nice stats.json that conforms to
        // our Stats type
        new StatsWriterPlugin({
            filename: 'stats.json',
            transform(data, _opts) {
                const assets = data.assetsByChunkName;
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
                test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
                type: 'asset',
            },
        ],
    },

    resolve: {
        extensions: [".browser.tsx", ".browser.ts", ".browser.jsx", ".browser.js", ".tsx", ".ts", ".jsx", ".js"],
        fallback: {
            'fs': false,
        },
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: isDevelopment ? '[name].js' : '[name].[contenthash:8].js',
        clean: true,
    }
}