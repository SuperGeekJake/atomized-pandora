var gulp           = require('gulp'),
autoprefixer   = require('gulp-autoprefixer'),
sass           = require('gulp-ruby-sass');

// Sass will check these folders for files when you use @import.
var sassPaths = [
'scss',
'bower_components/foundation-apps/scss'
];

// Compiles Sass
gulp.task('sass', function() {
  return gulp.src('scss/app.scss')
  .pipe(sass({
    loadPath: sassPaths,
    style: 'nested'
  }))
  .on('error', function(e) {
    console.log(e);
  })
  .pipe(autoprefixer({
    browsers: ['last 2 versions', 'ie 10']
  }))
  .pipe(gulp.dest('./client/css/'));
});

// Default task:
gulp.task('default', ['sass']);
