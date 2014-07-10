var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    return gulp.src('src/main.js')
        .pipe(browserify({debug: true}))
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./js'));
});

gulp.task('watch', ['scripts'], function(){
  return gulp.watch(['src/**/**.js'], ['scripts'])
});

gulp.task('default', ['watch'])
