"use strict";

let gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	maps = require('gulp-sourcemaps'),
	del = require('del'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	htmlreplace = require('gulp-html-replace'),
	cssmin = require('gulp-cssmin');

gulp.task("concatScripts", function() {
	return gulp.src([
		'assets/js/vendor/jquery/jquery-3.4.1.js',
		'assets/js/vendor/bootstrap/popper.min.js',
		'assets/js/vendor/bootstrap/bootstrap.js',
		'assets/js/functions.js'
	])
	.pipe(maps.init())
	.pipe(concat('main.js'))
	.pipe(maps.write('./'))
	.pipe(gulp.dest('assets/js'))
	.pipe(browserSync.stream());
});

gulp.task('minifyScripts', gulp.series('concatScripts', function() {
	return gulp.src("assets/js/main.js")
	.pipe(uglify())
	.pipe(rename('main.min.js'))
	.pipe(gulp.dest('dist/assets/js'));
}));

gulp.task('compileSass', function() {
	return gulp.src("assets/scss/main.scss")
	.pipe(maps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer())
	.pipe(maps.write('./'))
	.pipe(gulp.dest('assets/css'))
	.pipe(browserSync.stream());
});

gulp.task("minifyCss", gulp.series('compileSass', function() {
	return gulp.src("assets/css/main.css")
	.pipe(cssmin())
	.pipe(rename('main.min.css'))
	.pipe(gulp.dest('dist/assets/css'));
}));

gulp.task('watchFiles', function(done) {
	gulp.watch('assets/scss/**/*.scss', gulp.series('compileSass'));
	gulp.watch('assets/js/**/*.js', gulp.series('concatScripts'));

	done();
});

gulp.task('clean', function() {
	return del(['dist', 'assets/css/main*.css*', 'assets/js/main*.js*']);
});

gulp.task('renameSources', function() {
	return gulp.src(['*.html', '**/*.php', '!dist', '!dist/**'])
	.pipe(htmlreplace({
		'js': 'assets/js/main.min.js',
		'css': 'assets/css/main.min.css'
	}))
	.pipe(gulp.dest('dist/'));
});

gulp.task("build", gulp.series(gulp.parallel('minifyScripts', 'minifyCss'), function() {
	return gulp.src([
		'*.html',
		'*.php',
		'favicon.ico',
		"assets/img/**"
	], { base: './'})
	.pipe(gulp.dest('dist'));
}));

gulp.task('serve', gulp.series('watchFiles', function(){
  browserSync.init({
  	server: "./"
  });

  gulp.watch("assets/scss/**/*.scss", gulp.series('watchFiles'));
  gulp.watch(['*.html', '*.php']).on('change', browserSync.reload);
}));

gulp.task('default', gulp.series('clean', 'build', 'renameSources'));
