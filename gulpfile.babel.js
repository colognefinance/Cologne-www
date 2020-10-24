import gulp from 'gulp';

// Load all gulp plugins automatically
// and attach them to the `plugins` object
import plugins from 'gulp-load-plugins';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';

sass.compiler = require('node-sass');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

import del from 'del';


import pkg from './package.json';

const dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', (done) => {
  del([
    dirs.archive,
    dirs.dist
  ]).then(() => {
    done();
  });
});

gulp.task('copy:html', () => {
  return gulp.src(`${dirs.src}/*.html`)
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:image', () => {
  return gulp.src(`${dirs.src}/**/*.{gif,jpg,jpeg,png,svg}`)
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:resource', () =>
  gulp.src([
    // Copy all files
    `${dirs.src}/css/*`,
    `${dirs.src}/fonts/*`,
    `${dirs.src}/js/*`,
    `${dirs.src}/plugins/*`,
    `${dirs.src}/scss/*`,
    `${dirs.src}/video/*`,
    `${dirs.src}/*.html`
  ], {
    base: `${dirs.src}`
  }).pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:normalize', () =>
  gulp.src('node_modules/normalize.css/normalize.css')
  .pipe(gulp.dest(`${dirs.dist}/css`))
);

gulp.task('lint:js', () =>
  gulp.src([
    `${dirs.src}/js/*.js`,
  ]).pipe(plugins().eslint())
  .pipe(plugins().eslint.failOnError())
);

gulp.task('scss', () => {
  return gulp.src(['src/scss/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('.'))
    .on('error', onError)
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream());
});

var files = [
  '**/*.html',
  '**/*.css',
  '**/*.js',
  // Files/Directories to ignore
  '!node_modules/**/*',
  '!bower_components/**/*'
];

gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: './src/',
    },
    port: 8080
  })

  gulp.watch('src/scss/**/*.scss', gulp.series('scss'));
	gulp.watch(files).on('change', browserSync.reload);;
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task(
  'serve',
  gulp.series(
    'scss',
    'watch',
  )
);

gulp.task(
  'copy',
  gulp.series(
    'copy:image',
    'copy:resource'
  )
);

gulp.task(
  'build',
  gulp.series(
    gulp.parallel('clean'),
    'copy'
  )
);

gulp.task('default', gulp.series('build'));

function onError(err) {
  console.log(err);
  this.emit('end');
}
