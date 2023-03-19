// Waveforme webpack.config.server.js
// Copyright (C) 2023 Reese Norris - All Rights Reserved

const path = require('path');
const slsw = require("serverless-webpack");

module.exports = {
    entry: slsw.lib.entries,
    mode: 'development',
    devtool: 'nosources-source-map',
    target: 'node',

    optimization: {
        minimize: false,
        moduleIds: 'named',
    },

    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/, // we shouldn't need processing `node_modules`
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: "null-loader", // No server-side CSS processing
            },
            {
                test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
                type: 'asset',
            },
        ],
    },

    resolve: {
        extensions: [".server.tsx", ".server.ts", ".server.jsx", ".server.js", ".tsx", ".ts", ".jsx", ".js"],
    },

    output: {
        library: {
            type: 'commonjs2',
        },
        path: path.join(__dirname, ".webpack"),
        filename: "[name].js",
        sourceMapFilename: "[file].map",
    },

    externals: {
        "argon2": "argon2",
    },
}