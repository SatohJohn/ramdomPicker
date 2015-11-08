var gulp = require('gulp');
var sass = require('gulp-sass');
var webserver = require('gulp-webserver');
var convert = require('gulp-convert');

gulp.task('default', ['convert', 'connect', 'watch']);

gulp.task('html', function () {
	gulp.src('./app/**/*.html')
		.pipe(webserver.reload());
});
gulp.task('js', function () {
	gulp.src('./app/**/*.js')
		.pipe(webserver.reload());
});

gulp.task('sass', function() {
	gulp.src('./app/sass/**/*.scss')
		.pipe(sass())
		.on('error', function(e) {
			console.log(e.message);
		})
		.pipe(gulp.dest('./app/css'));
});

gulp.task('watch', function () {
	gulp.watch([
			'app/**/*.sass',
			'app/**/*.js',
			'app/**/*.html'
		], [
			'sass',
			'js',
			'html'
		]);
});

gulp.task('convert', function() {
	// csvをjsonにコンバートする
	gulp.src('./app/resource/entry.csv')
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

