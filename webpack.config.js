const webpack = require('webpack');

module.exports = [
    {
        entry: ['babel-regenerator-runtime', './src/index.js'],
        output: {
            path: './dist',
            filename: 'index.js',
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    cacheDirectory: true
                }
            }]
        }
    },{
        entry: ['babel-regenerator-runtime', './src/index.js'],
        output: {
            path: './dist',
            filename: 'index.min.js',
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    cacheDirectory: true
                }
            }]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
                output: {
                    comments: false,
                },
            })
        ]
    }
];
