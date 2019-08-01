var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var StringReplacePlugin = require("string-replace-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var extractLESS = new ExtractTextPlugin('[name].css');

var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

// Copy images
var fsExtra = require('fs-extra');
fsExtra.copySync(path.resolve(ROOT_PATH, './src/img'), BUILD_PATH + '/img');

// Copy lib
fsExtra.copySync(path.resolve(ROOT_PATH, './src/lib'), BUILD_PATH + '/lib');


var pages = fs.readdirSync(path.resolve(ROOT_PATH, 'src/pages'));
var i18nFiles = fs.readdirSync(path.resolve(ROOT_PATH, 'src/i18n'));
var i18nMap = {};
var assetsHomeBase = 'https://assets.enhancer.io/enhancer/site-assets/0.8.0/';
// var assetsHomeBase = 'http://localhost:8001/build/';

pages.forEach( function (page) {
  var i18nFiles = fs.readdirSync(path.resolve(ROOT_PATH, 'src/pages/' + page + '/i18n'));
  i18nFiles.forEach( function (item, i) {
    if (item.indexOf('index') == 0) {
      return;
    }
    var lang = item.match(/locale\.([a-z-]+)\.js/)[1];
    i18nMap[lang] = i18nMap[lang] || [];
    i18nMap[lang].push(page);
  });
});

var ret = [];
for (var lang in i18nMap) {
  i18nMap[lang].forEach( function (page) {
      var JSENTRIES = {};
      JSENTRIES[page] = [path.resolve(ROOT_PATH, 'src/pages/' + page + '/index.js')];
      ret.push({
        stats: {
          // warnings: false
        },
        entry: JSENTRIES,
        output: {
          path: BUILD_PATH + '/pages/' + lang,
          filename: "[name].js"
        },
        devServer: {
          contentBase: "./src"
        },
        resolve: {
          alias: {
            i18n: path.resolve(ROOT_PATH, 'src/pages/' + page + '/i18n')
          } 
        },
        module: {
          loaders: [
            {
              test: /\.(jpe?g|png|gif|svg)$/i,
              loader: 'url-loader'
            },
            {    
              test: /\.js$/,    
              exclude: /node_modules/,    
              loaders: [
                StringReplacePlugin.replace({
                  replacements: [
                      {
                          pattern: /\$ASSETS_HOME/g,
                          replacement: (function(l) {
                            return function (match, p1, offset, string) {
                              return  assetsHomeBase + l;
                            }
                          })(lang)
                      }
                  ]}),
                'babel-loader'
              ]
            },
            {
              test: /\.css$/,
              loaders: ['style', 'css']
            },
            {
               test: /\.less$/,
               loader: extractLESS.extract([{
                  loader: 'css-loader',
                  options: {
                    minimize: true
                  }
                }, 
                StringReplacePlugin.replace({
                  replacements: [
                      {
                          pattern: /\$ASSETS_HOME/g,
                          replacement: (function(l) {
                            return function (match, p1, offset, string) {
                              return  assetsHomeBase + l;
                            }
                          })(lang)
                      }
                  ]}),
                {
                  loader: 'less-loader',
                  options: {
                    minimize: true
                  }
                }])
            },
            {
              test: /\.html$/,
              loaders: [
                StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /\$ASSETS_HOME/g,
                            replacement: (function(l) {
                              return function (match, p1, offset, string) {
                                return assetsHomeBase + l;
                              }
                            })(lang)
                        }
                    ]}), 
                'handlebars-loader'
              ]
            }
          ]
        },
        plugins: [
          new webpack.DefinePlugin({
              LANG: "\'" +  lang + "\'"
          }),
          new StringReplacePlugin(),
          new webpack.optimize.UglifyJsPlugin({minimize: true}),
          extractLESS
        ]
      })
  });
}

ret[0].plugins.push(new BrowserSyncPlugin({
  host: '127.0.0.1',
  port: 8001,
  server: { 
    baseDir: ['.'],
    files: ['src/pages/**/*.js', 
      'src/pages/**/*.less', 'src/components/**/*.js', 
      'src/components/**/*.less'] 
  }
}));

module.exports = ret
