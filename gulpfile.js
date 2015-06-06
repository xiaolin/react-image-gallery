'use strict';

var browserify = require('browserify');
var connect = require('gulp-connect');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var reactify = require('reactify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var watchify = require('watchify');


function swallowError(error) {
  console.error(error.toString());
}

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
    .on('error', swallowError)
    .pipe(rename('image-gallery.css'))
    .pipe(gulp.dest('./build/'))
    .pipe(livereload());
});

gulp.task('scripts', function() {
  watchify(browserify({
    entries: ['./example/app.js'],
    extensions: ['.jsx'],
    transform: [reactify]
  }))
    .bundle()
    .on('error', swallowError)
    .pipe(source('example.js'))
    .pipe(gulp.dest('./example/'))
    .pipe(livereload());
});

gulp.task('build', function() {
  browserify({
    entries: ['./src/ImageGallery.react.jsx'],
    transform: [reactify],
    standalone: 'ImageGallery'
  })
    .external(['react/addons', 'react-swipeable'])
    .bundle()
    .on('error', swallowError)
    .pipe(source('image-gallery.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['src/*.scss'], ['sass']);
  gulp.watch(['src/*.jsx', 'example/app.js'], ['scripts']);
});

gulp.task('dev', ['watch', 'scripts', 'sass', 'server']);
