'use strict';

var babelify = require('babelify');
var babel = require('gulp-babel');
var browserify = require('browserify');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('server', function () {
  connect.server({
    root: ['example', 'build'],
    port: 8001,
    livereload: true
  });
});

gulp.task('sass', function () {
  gulp.src('./src/ImageGallery.scss')
    .pipe(sass())
    .pipe(rename('image-gallery.css'))
    .pipe(gulp.dest('./build/'))
    .pipe(livereload());
});

gulp.task('scripts', function() {
  watchify(browserify({
    entries: ['./example/app.js'],
    extensions: ['.jsx'],
    transform: [babelify]
  }))
    .bundle()
    .pipe(source('example.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./example/'))
    .pipe(livereload());
});

gulp.task('source-js', function () {
  return gulp.src('./src/ImageGallery.react.jsx')
    .pipe(concat('image-gallery.js'))
    .pipe(babel())
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['src/*.scss'], ['sass']);
  gulp.watch(['src/*.jsx', 'example/app.js'], ['scripts']);
});

gulp.task('dev', ['watch', 'scripts', 'sass', 'server']);
gulp.task('build', ['source-js', 'sass']);
