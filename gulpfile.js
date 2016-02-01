var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var copy = require('gulp-copy');
var environments = require('gulp-environments');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');

var jsVendorFiles = [
    'assets/vendor/jquery/dist/jquery.js',
    'assets/vendor/angular/angular.js',
    'assets/vendor/angular-animate/angular-animate.js',
    'assets/vendor/angular-aria/angular-aria.js',
    'assets/vendor/angular-route/angular-route.js',
    'assets/vendor/angular-sanitize/angular-sanitize.js',
    'assets/vendor/angular-material/angular-material.js',
    'assets/vendor/Sortable/Sortable.js',
    'assets/vendor/Sortable/ng-sortable.js',
    'assets/vendor/Chart.js/Chart.js',
    'assets/vendor/angular-chart.js/dist/angular-chart.js',
    'assets/vendor/angular-material-data-table/dist/md-data-table.min.js',
    'assets/vendor/angular-filter/dist/angular-filter.min.js'
];
var jsFiles = [
    'assets/js/dashboard-app.js',
    'assets/js/router.js',
    'assets/js/services/**/*.js',
    'assets/js/directives/**/*.js',
    'assets/js/filters/**/*.js',
    'assets/js/controllers/**/*.js'
];
var cssFiles = [
    'assets/vendor/angular-material/angular-material.css',
    'assets/vendor/font-awesome/css/font-awesome.css',
    'assets/vendor/angular-chart.js/dist/angular-chart.css',
    'assets/vendor/angular-material-data-table/dist/md-data-table.min.css',
    'assets/css/blocks/**/*.css',
    'assets/css/dashboard.css'
];
var destDir = 'public/custom';

var development = environments.development;
var production = environments.production;

gulp.task('vendor', function() {
    return gulp.src(jsVendorFiles)
        .pipe(development(plumber()))
        .pipe(development(sourcemaps.init()))
        .pipe(ngAnnotate().on('error', gutil.log))
        .pipe(concat('vendor.js'))
        .pipe(production(uglify()))
        .pipe(development(sourcemaps.write('.')))
        .pipe(gulp.dest(destDir + '/js'));
});

gulp.task('js', function() {
   return gulp.src(jsFiles)
       .pipe(development(plumber()))
       .pipe(development(sourcemaps.init()))
       .pipe(ngAnnotate().on('error', gutil.log))
       .pipe(concat('dashboard-app.js'))
       .pipe(production(uglify()))
       .pipe(development(sourcemaps.write('.')))
       .pipe(gulp.dest(destDir + '/js'));
});

gulp.task('css', function() {
    return gulp.src(cssFiles)
        .pipe(development(plumber()))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({browsers: ['last 2 versions', 'IE 9', 'IE 10']}))
        .pipe(concat('dashboard.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir + '/css'));
});

gulp.task('fonts', function() {
    return gulp.src('assets/vendor/font-awesome/fonts/*')
        .pipe(copy(destDir + '/fonts', {prefix: 4}));
});



gulp.task('default', ['fonts', 'css', 'vendor', 'js']);

gulp.task('watch', ['fonts', 'vendor', 'js', 'css'], function() {
    gulp.watch('assets/js/**/*.js', ['js']);
    gulp.watch('assets/css/**/*.css', ['css']);
});
