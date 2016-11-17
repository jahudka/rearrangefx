var gulp = require('gulp'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    zip = require('gulp-zip'),
    NwBuilder = require('nw-builder'),
    meta = require('./package.json');

gulp.task('jsx', function () {
    return gulp.src('scripts/**/*.jsx')
        .pipe(babel({
            presets: [
                "react"
            ],
            plugins: [
                "transform-es2015-destructuring",
                "transform-object-rest-spread"
            ]
        }))
        .pipe(rename({extname: '.js'}))
        .pipe(gulp.dest('scripts/'));
});

gulp.task('js', ['jsx'], function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/react/dist/react.min.js',
        'node_modules/react-dom/dist/react-dom.min.js',
        'scripts/ini.js',
        'scripts/bootstrap.js',
        'scripts/components/folder.js',
        'scripts/components/folderView.js',
        'scripts/components/gridView.js',
        'scripts/lib.io.js',
        'scripts/lib.db.js',
        'scripts/lib.dom.js',
        'scripts/lib.file.js',
        'scripts/lib.state.js',
        'scripts/api.js',
        'scripts/menu.js',
        'scripts/preferences.js',
        'scripts/updateCheck.js',
        'scripts/main.js'
    ])
    .pipe(concat('rfx.min.js'))
    .pipe(uglify({
        compress: true
    })).pipe(gulp.dest('scripts/'));
});

gulp.task('css', function () {
    return gulp.src([
        'styles/styles.less'
    ])
    .pipe(less({
        compress: true
    }))
    .pipe(concat('rfx.min.css'))
    .pipe(gulp.dest('styles/'));
});


gulp.task('watch', function () {
    gulp.watch(['scripts/**/*.jsx'], ['jsx']);
    gulp.watch(['scripts/**/*.js', '!scripts/rfx.min.js'], ['js']);
    gulp.watch(['styles/**/*.{css,less}', '!styles/rfx.min.css'], ['css']);
});




gulp.task('cleanup-osx32', function () {
    return del([
        './../build/' + meta.name + '/osx32/**',
        './../build/' + meta.name + '-osx32.zip'
    ], {force: true});
});

gulp.task('cleanup-osx64', function () {
    return del([
        './../build/' + meta.name + '/osx64/**',
        './../build/' + meta.name + '-osx64.zip'
    ], {force: true});
});

gulp.task('cleanup-win32', function () {
    return del([
        './../build/' + meta.name + '/win32/**',
        './../build/' + meta.name + '-win32.zip'
    ], {force: true});
});

gulp.task('cleanup-win64', function () {
    return del([
        './../build/' + meta.name + '/win64/**',
        './../build/' + meta.name + '-win64.zip'
    ], {force: true});
});

gulp.task('cleanup', ['cleanup-osx32', 'cleanup-osx64', 'cleanup-win32', 'cleanup-win64']);



var files = [
    'main.htm',
    'package.json',
    'styles/rfx.min.css',
    'scripts/rfx.min.js',
    'node_modules/font-awesome/**',
    'node_modules/lodash/**',
    'node_modules/promise/**',
    'node_modules/promise/node_modules/asap/**',
    'node_modules/react/**',
    'node_modules/fbjs/**',
    'node_modules/core-js/**',
    'node_modules/isomorphic-fetch/**',
    'node_modules/node-fetch/**',
    'node_modules/encoding/**',
    'node_modules/iconv-lite/**',
    'node_modules/is-stream/**',
    'node_modules/whatwg-fetch/**',
    'node_modules/ua-parser-js/**',
    'node_modules/loose-envify/**',
    'node_modules/js-tokens/**',
    'node_modules/object-assign/**',
    'node_modules/react-dom/**'
];

gulp.task('build-osx32', ['cleanup-osx32'], function () {
    var nw = new NwBuilder({
        files: files,
        version: '0.12.3',
        flavor: 'normal',
        platforms: ['osx32'],
        macIcns: './icons/icon.icns',
        buildDir: './../build'
    });

    nw.on('log', console.log.bind(console));
    return nw.build();
});

gulp.task('build-osx64', ['cleanup-osx64'], function () {
    var nw = new NwBuilder({
        files: files,
        version: '0.12.3',
        flavor: 'normal',
        platforms: ['osx64'],
        macIcns: './icons/icon.icns',
        buildDir: './../build'
    });

    nw.on('log', console.log.bind(console));
    return nw.build();
});

gulp.task('build-win32', ['cleanup-win32'], function () {
    var nw = new NwBuilder({
        files: files,
        version: '0.12.3',
        flavor: 'normal',
        platforms: ['win32'],
        winIco: './icons/icon.ico',
        buildDir: './../build'
    });

    nw.on('log', console.log.bind(console));
    return nw.build();
});

gulp.task('build-win64', ['cleanup-win64'], function () {
    var nw = new NwBuilder({
        files: files,
        version: '0.12.3',
        flavor: 'normal',
        platforms: ['win64'],
        winIco: './icons/icon.ico',
        buildDir: './../build'
    });

    nw.on('log', console.log.bind(console));
    return nw.build();
});

gulp.task('build', ['build-osx32', 'build-osx64', 'build-win32', 'build-win64']);



gulp.task('zip-osx32', ['build-osx32'], function () {
    gulp.src([
        './../build/' + meta.name + '/osx32/' + meta.name + '.app/**'
    ], {
        base: './../build/' + meta.name + '/osx32'
    })
    .pipe(zip(meta.name + '-' + meta.version + '-osx32.zip'))
    .pipe(gulp.dest('./../build'));
});

gulp.task('zip-osx64', ['build-osx64'], function () {
    gulp.src([
        './../build/' + meta.name + '/osx64/' + meta.name + '.app/**'
    ], {
        base: './../build/' + meta.name + '/osx64'
    })
    .pipe(zip(meta.name + '-' + meta.version + '-osx64.zip'))
    .pipe(gulp.dest('./../build'));
});

gulp.task('zip-win32', ['build-win32'], function () {
    gulp.src([
        './../build/' + meta.name + '/win32/**',
        '!**/*.DS_Store'
    ], {
        base: './../build/' + meta.name + '/win32'
    })
    .pipe(zip(meta.name + '-' + meta.version + '-win32.zip'))
    .pipe(gulp.dest('./../build'));
});

gulp.task('zip-win64', ['build-win64'], function () {
    gulp.src([
        './../build/' + meta.name + '/win64/**',
        '!**/*.DS_Store'
    ], {
        base: './../build/' + meta.name + '/win64'
    })
    .pipe(zip(meta.name + '-' + meta.version + '-win64.zip'))
    .pipe(gulp.dest('./../build'));
});

gulp.task('zip', ['zip-osx32', 'zip-osx64', 'zip-win32', 'zip-win64']);




gulp.task('default', ['jsx', 'js', 'css']);
gulp.task('dist', ['build', 'zip']);
gulp.task('osx32', ['build-osx32', 'zip-osx32']);
gulp.task('osx64', ['build-osx64', 'zip-osx64']);
gulp.task('win32', ['build-win32', 'zip-win32']);
gulp.task('win64', ['build-win64', 'zip-win64']);
