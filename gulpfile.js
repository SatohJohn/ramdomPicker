var gulp = require('gulp');
var webserver = require('gulp-webserver');
var convert = require('gulp-convert');
var encode = require('gulp-convert-encoding');

gulp.task('default', ['convert', 'connect', 'watch']);

gulp.task('html', function () {
	gulp.src('./app/**/*.html')
		.pipe(webserver.reload());
});
gulp.task('js', function () {
	gulp.src('./app/**/*.js')
		.pipe(webserver.reload());
});

gulp.task('watch', function () {
	gulp.watch([
			'app/**/*.js',
			'app/**/*.html'
		], [
			'js',
			'html'
		]);
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
			open: true,
			livereload: true
		}));
});

