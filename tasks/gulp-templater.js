'use strict';

var template    = require('gulp-template'),
    gutil       = require('gulp-util');

try {
var diff        = require('gulp-diff-build');
} catch (e) {}

module.exports = function(gulp,config){

    try {
        config.onrequire && config.onrequire();
    } catch (err) { throw err }

    var opts = config.opts || {};
        opts.withDiff   = (typeof diff !== 'undefined' & typeof opts.withDiff !== 'undefined') ? opts.withDiff : false;

    gulp.task(config.task ,function(){

        config.onlaunch && config.onlaunch();

        return gulp.src(config.src ,{base:config.bas})
               .pipe(template(config.datas))
               .pipe(opts.withDiff ? diff({clean:true,hash:config.task}) : gutil.noop())
               .pipe(gulp.dest(config.dst));

    });
};