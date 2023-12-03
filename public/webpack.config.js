// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';


const stylesHandler = 'style-loader';


const config = {
   entry: './src/index.ts',
   output: {
      path: path.resolve(__dirname, 'dist'),
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: './src/index.html',
      }),
      new CopyPlugin({
         patterns: [
            { from: "src/*.css"     , to: "[name][ext]" },
            { from: "src/404.html"  , to: "[name][ext]" },

            { from: "src/fonts"     , to: "fonts" },
            { from: "src/images"    , to: "images" },
            { from: "src/licenses"  , to: "licenses" },
            { from: "src/lib"       , to: "lib" }  
         ]
      })
      //// Work around for Buffer is undefined:
      //// https://github.com/webpack/changelog-v5/issues/10
      //new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
      //new webpack.ProvidePlugin({ process: 'process/browser', })
   ],
   module: {
      rules: [
         {
            test: /\.(ts|tsx)$/i,
            loader: 'ts-loader',
            exclude: ['/node_modules/'],
         },
         {
            test: /\.css$/i,
            use: [stylesHandler, 'css-loader'],
         },
         {
            test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
            type: 'asset',
         },
         {
            test: /\.js$/,
            enforce: "pre",
            use: ["source-map-loader"],
         },
         // Add your rules for custom modules here
         // Learn more about loaders from https://webpack.js.org/loaders/
      ],
   },
   resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
   },
};

module.exports = () => {
   if (isProduction) {
      config.mode = 'production';


   } else {
      config.mode = 'development';
   }
   return config;
};
