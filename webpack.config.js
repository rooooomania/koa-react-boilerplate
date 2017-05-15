const webpack = require('webpack');
const path = require('path');

const ROOT_PATH = path.resolve(__dirname);

module.exports = {
    devtool: 'source-map',
    entry: [
        path.resolve(ROOT_PATH, 'app/src/index.js'),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        'es2015',
                        'react'
                    ],
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output: {
        path: path.resolve(ROOT_PATH, 'api/build/public/js'),
        // TODO: static contentの指定がおかしくて、devserver使えない
        publicPath: '/',
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.resolve(ROOT_PATH, 'api'),
        compress: true,
        port: 8080,
        historyApiFallback: true,
        // hot: true,
        inline: true,
    },
    // plugins: [],
};