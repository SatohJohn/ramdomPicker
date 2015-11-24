var gulp = require('gulp');
var webserver = require('gulp-webserver');
var convert = require('gulp-convert');
var encode = require('gulp-convert-encoding');
var browser = require("browser-sync");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var postcss = require("gulp-postcss");
var changed = require("gulp-change");

gulp.task('default', ['convert', 'connect', 'watch']);

gulp.task('js', function () {
	gulp.src("app/js/**/*.js")
		.pipe(plumber())
		.pipe(changed("app/js"))
		.pipe(browser.reload({stream:true}));
});

gulp.task('html', function () {
	gulp.src("app/html/**/*.html")
		.pipe(plumber())
		.pipe(browser.reload({stream:true}));
});

gulp.task('css', function () {
	var plugins = [
		require('postcss-nested'),
		require('postcss-mq-keyframes'),
		require('precss')({ /* options */ }),
		require('autoprefixer')
//		require('cssnano')
	];
	gulp.src("app/scss/**/*.scss")
		.pipe(plumber())
		.pipe(postcss(plugins))
		.pipe(rename({
			extname: '.css'
		}))
		.pipe(gulp.dest("app/css"))
		.pipe(browser.reload({stream:true}));
});

gulp.task('watch', function () {
	gulp.watch('app/**/*.js', ['js']).on('change', browser.reload);
	gulp.watch('app/**/*.scss', ['css']).on('change', browser.reload);
	gulp.watch('app/**/*.html', ['html']).on('change', browser.reload);
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
	browser({
		notify: true,
		open: true,
		server: {
			baseDir: "./app",
			index: 'html/main.html'
		}
	});
});

