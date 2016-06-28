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
                    cacheDirectory: true,
                    presets: [
                        'es2015',
                        'stage-0',
                        'stage-1',
                        'stage-2',
                        'stage-3'
                    ]
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
                    cacheDirectory: true,
                    presets: [
                        'es2015',
                        'stage-0',
                        'stage-1',
                        'stage-2',
                        'stage-3'
                    ]
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
