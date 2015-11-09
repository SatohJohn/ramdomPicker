var gulp = require('gulp');
var webserver = require('gulp-webserver');
var convert = require('gulp-convert');
var encode = require('gulp-convert-encoding');
var cssnext = require("gulp-cssnext");
var browser = require("browser-sync");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var postcss = require("gulp-postcss");

gulp.task('default', ['convert', 'connect', 'watch']);

gulp.task('js', function () {
	gulp.src("app/js/**/*.js")
		.pipe(plumber())
		.pipe(gulp.dest("app/js"))
		.pipe(browser.reload({stream:true}))
});

gulp.task('html', function () {
	gulp.src("app/html/**/*.html")
		.pipe(plumber())
		.pipe(browser.reload({stream:true}))
});

gulp.task('css', function () {
	var plugins = [
		require('postcss-mixins'),
		require('postcss-simple-vars'),
		require('postcss-nested'),
		require('cssnext'),
		require('cssnano')
	];
	gulp.src("app/scss/**/*.scss")
		.pipe(postcss(plugins))
		.pipe(rename({
			extname: '.css'
		}))
		.pipe(gulp.dest("app/css"))
		.pipe(browser.reload({stream:true}))
});

gulp.task('watch', function () {
	gulp.watch('app/**/*.js', ['js']);
	gulp.watch('app/**/*.scss', ['css']);
	gulp.watch('app/**/*.html', ['html']);
});

gulp.task('convert', function() {
	// csvをjsonにコンバートする
	gulp.src('./app/resource/entry.csv')
		.pipe(encode({
			from: 'Shift_JIS',
			to: 'UTF-8'
		}))
		.pipe(convert({
			from: 'csv',
			to: 'json'
		}))
		.pipe(gulp.dest('./app/resource'));
})

gulp.task('connect', function() {
	gulp.src('app')
		.pipe(webserver({
			directoryListing: {
				enable: true,
				path: 'app'
			},
		}));
});

