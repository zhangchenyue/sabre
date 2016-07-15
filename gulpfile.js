var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    gulp = require('gulp'),
    KServer = require('karma').Server;

var paths = {
    src: './src/',
    dist: './dist/'
}

paths.SabreBasejs = paths.src + 'Sabre.base/**/*.js';
paths.SabreBaseUIjs = paths.src + 'Sabre.base.ui/**/*.js';
paths.SabreBaseUIcss = paths.src + 'Sabre.base.ui/**/*.css';

paths.SabreLGjs = paths.src + 'Sabre.lg/**/*.js';
paths.SabreLGUIjs = paths.src + 'Sabre.lg.ui/**/*.js';
paths.SabreLGUIcss = paths.src + 'Sabre.lg.ui/**/*.css';

paths.Sabrejs = paths.src + '**/*.js';
paths.Sabrecss = paths.src + '**/*.css';

paths.minSabreBasejs = paths.dist + 'components/Sabre.base.min.js';
paths.minSabreBaseUIjs = paths.dist + 'components/Sabre.base.ui.min.js';

paths.minSabreLGjs = paths.dist + 'components/Sabre.lg.min.js';
paths.minSabreLGUIjs = paths.dist + 'components/Sabre.lg.ui.min.js';

paths.minSabreBaseUIcss = paths.dist + 'components/Sabre.base.ui.min.css';
paths.minSabreLGUIcss = paths.dist + 'components/Sabre.lg.ui.min.css';

paths.minSabrejs = paths.dist + 'Sabre.min.js';
paths.minSabrecss = paths.dist + 'Sabre.min.css';

paths.minjs = paths.dist + '**/*.js';
paths.mincss = paths.dist + '**/*.css';
gulp.task('clean:minjs', function(cb) {
    rimraf(paths.minjs, cb);
})

gulp.task('clean:mincss', function(cb) {
    rimraf(paths.mincss, cb);
})

gulp.task('min:SabreBasejs', function() {
    gulp.src([paths.SabreBasejs], { base: '.' })
        .pipe(concat(paths.minSabreBasejs))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:SabreBaseUIjs', function() {
    gulp.src([paths.SabreBaseUIjs], { base: '.' })
        .pipe(concat(paths.minSabreBaseUIjs))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:SabreLGjs', function() {
    gulp.src([paths.SabreLGjs], { base: '.' })
        .pipe(concat(paths.minSabreLGjs))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:SabreLGUIjs', function() {
    gulp.src([paths.SabreLGUIjs], { base: '.' })
        .pipe(concat(paths.minSabreLGUIjs))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:SabreBaseUIcss', function() {
    gulp.src([paths.SabreBaseUIcss], { base: '.' })
        .pipe(concat(paths.minSabreBaseUIcss))
        .pipe(cssmin())
        .pipe(gulp.dest('.'));
});

gulp.task('min:SabreLGUIcss', function() {
    gulp.src([paths.SabreLGUIcss], { base: '.' })
        .pipe(concat(paths.minSabreLGUIcss))
        .pipe(cssmin())
        .pipe(gulp.dest('.'));
});

gulp.task('min:Sabrejs', function() {
    gulp.src([paths.Sabrejs], { base: '.' })
        .pipe(concat(paths.minSabrejs))
       // .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:Sabrecss', function() {
    gulp.src([paths.Sabrecss], { base: '.' })
        .pipe(concat(paths.minSabrecss))
        .pipe(cssmin())
        .pipe(gulp.dest('.'));
});


gulp.task('karma:unittest', function(done) {
    new KServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('default',
    [
        'clean:minjs',
        'clean:mincss',
        'min:SabreBasejs',
        'min:SabreBaseUIjs',
        'min:SabreLGjs',
        'min:SabreLGUIjs',
        'min:SabreBaseUIcss',
        'min:SabreLGUIcss',
        'min:Sabrejs',
        'min:Sabrecss',
        'karma:unittest'
    ]);