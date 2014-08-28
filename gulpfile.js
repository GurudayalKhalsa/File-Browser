var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    return gulp.src('public/src/main.js')
        .pipe(browserify({debug: true}))
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', ['scripts'], function(){
  return gulp.watch(['public/src/**/**.js'], ['scripts'])
});

gulp.task('default', ['watch'])
