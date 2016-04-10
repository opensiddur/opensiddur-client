// Karma configuration
// Generated on Sun Apr 19 2015 21:58:20 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'js/bower_components/jquery/dist/jquery.js',
      'js/bower_components/underscore/underscore-min.js',
      {pattern: 'js/bower_components/underscore/underscore-min.map', included:false, served:true},
      'js/bower_components/angular/angular.js',
      'js/bower_components/angular-mocks/angular-mocks.js',
      'js/thirdparty/saxon-ce/Saxonce/Saxonce.nocache.js',
      {pattern: 'js/thirdparty/saxon-ce/Saxonce/*', included:false, served:true},
      {pattern: 'js/text/*.xsl', included:false, served:true},
      'js/tests/equivalent-xml.js',
      'js/tests/spec-helper.js',
      'js/error/osError.module.js',
      'js/error/Error.service.js',
      'js/xslt/xslt.module.js',
      'js/xslt/Xslt.service.js',
      'js/xslt/*.test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    proxies: {
        "/js/": "/base/js/"
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'html'],
    htmlReporter : {
      outputDir: "karma_html",
      templatePath: null,
      focusOnFailures: true,
      namedFiles: false,
      pageTitle: null,
      urlFriendlyName: false,
      reportName: 'report-summary'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
