const path = require('path');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const extractmin = require('mini-css-extract-plugin');
const colorprogress = require('colored-progress-bar-webpack-plugin');

module.exports = {

    mode: 'production',
    devtool: 'source-map',
    
    output: {
        filename: 'main.bundle.js',
        chunkFilename: 'main.hash.chunk.js',
        path: path.resolve(__dirname, 'public/css'),
        publicPath: '/public/css'
    },

    resolve:{
        extensions: ['.css', '.scss'],
        alias: {
            '~': path.resolve(process.cwd(), 'scss'),
        },
    },

    entry: {
        'styles': './scss/main.scss',
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    extractmin.loader,
                    { loader: 'css-loader', options: { url: false, importLoaders: 1 } },
                    { loader: 'postcss-loader', options: { 
                            postcssOptions: {
                                plugins: [autoprefixer(), cssnano()],
                            }
                        } 
                    },
                    { loader: 'sass-loader' },
                ]
            }
        ],
    },

    plugins: [
        new extractmin({
            filename: 'main.css',
            chunkFilename: 'main.chunk.css',
        }),
        new colorprogress(
            {
                showStatus: true,
                showBar: true,
                showPercent: true,
                showMessage: true,
                showDetail: true,
              
                colorAll: null,
                colorStatus: 'green',
                colorBar: 'lightCyan',
                colorPercent: 'blue',
                colorMessage: 'lightYellow',
                colorDetail: 'lightMagenta',
              
                width: 100,
                completeChar: '█',
                incompleteChar: '░',
                alignDetailOnBar: true,
                hideCursor: true,
                notification: true,
            }
        ),
    ],

    watchOptions: {
        poll: true,
        ignored: /node_modules/
    },

    devServer: {
        port: 4444,
        contentBase: '*',
        watchContentBase: true,
        allowedHosts: 'all',
    }

}