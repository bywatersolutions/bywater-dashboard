var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var copy =require('gulp-copy');

var jsFiles = [
    'assets/vendor/jquery/dist/jquery.js',
    'assets/vendor/angular/angular.js',
    'assets/vendor/angular-animate/angular-animate.js',
    'assets/vendor/angular-aria/angular-aria.js',
    'assets/vendor/angular-route/angular-route.js',
    'assets/vendor/angular-material/angular-material.js',
    'assets/vendor/Sortable/Sortable.js',
    'assets/vendor/Sortable/ng-sortable.js',
    'assets/js/dashboard-app.js',
    'assets/js/router.js',
    'assets/js/services/**/*.js',
    'assets/js/directives/**/*.js',
    'assets/js/controllers/**/*.js'
];
var cssFiles = [
    'assets/vendor/angular-material/angular-material.css',
    'assets/vendor/font-awesome/css/font-awesome.css',
    'assets/css/dashboard.css'
];
var destDir = 'public/custom';



gulp.task('js', function() {
   return gulp.src(jsFiles)
       .pipe(sourcemaps.init())
       .pipe(ngAnnotate())
       .pipe(concat('dashboard-app.js'))
       .pipe(uglify())
       .pipe(sourcemaps.write('.'))
       .pipe(gulp.dest(destDir + '/js'));
});

gulp.task('css', function() {
    return gulp.src(cssFiles)
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



gulp.task('default', ['fonts', 'css', 'js']);

gulp.task('watch', ['fonts'], function() {
    gulp.watch('assets/js/**/*.js', ['js']);
    gulp.watch('assets/css/**/*.css', ['css']);
});