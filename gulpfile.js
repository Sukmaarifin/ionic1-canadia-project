//=============================================LIB=======================================//
var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var fs = require('fs');
//var packageJSON = require('../../package.json');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var cleanDest = require('gulp-dest-clean');
var uglify = require('gulp-uglify');
var paths = {
    sass: ['./scss/**/*.scss']
};

var ionicPath = {
    propertiesJS : ['app/js/*.properties.js','app/js/**/*.properties.js','app/js/**/**/*.properties.js'],
    nativeJS :['app/js/util/nativeJS/*.js',
        'app/js/util/nativeJS/**/*.js'],
    languageJS :['app/js/util/languages/*.js'],
    angularJS:['app/js/*.js',
        //'app/js/dumpFile/*.js',
        'app/js/adapter/**/*.js',
        'app/js/directive/**/*.js',
        'app/js/modules/**/*.js',
        'app/js/modules/**/**/*.js',
        'app/js/services/**/*.js',
        'app/js/util/**/*.js',
        'app/js/util/**/**/*.js',
        '!app/js/*.properties.js'],
    templateHTML :['app/templates/*.html','app/templates/**/*.html','app/templates/**/**/*.html','app/templates/**/**/**/*.html'],
    scss:['app/scss/*.scss'],
    css:['app/css/*.css','app/css/**/*.css'],
    lib:['app/lib/*'],
    img:['app/img/*','app/img/**/*','app/img/**/**/*','app/img/**/**/**/*'],
    font:['app/font/*',
        'app/font/**/*',
        'app/font/**/*.ttf',
        'app/font/**/*.otf',
        'app/font/**/**/*',
        'app/font/**/**/**/*']
};
var shell = require('gulp-shell');

//gulp exec cordova
function execCordovaPlugin(){
    fs.readFile('package.json',function(err,streamVal){
        console.log("adding cordova plugin :");
        var packageJSON = JSON.parse(streamVal.toString());
        var execAddPlugins = [];
        for(var i =0;i<packageJSON.cordovaPlugins.length;i++){
            console.log((i+1)+"cordova plugin add "+packageJSON.cordovaPlugins[i]+"");
            execAddPlugins.push("cordova plugin add "+packageJSON.cordovaPlugins[i]+"");
        }
        gulp.src("package.json")
            .pipe(shell(execAddPlugins,{
                f: function (s) {
                    return s.replace(/$/, '.bak')
                }
                ,ignoreErrors:true
            }));

    });
}
//gulp exec npm install
function execNpmInstall(){
    console.log("npm install");
    gulp.src("package.json")
        .pipe(shell(['npm install'],{
            f: function (s) {
                return s.replace(/$/, '.bak')
            }
            ,ignoreErrors:true
        }));
}
//gulp exec generate file
function execGenerateFile(){
    gulp.src(ionicPath.propertiesJS)
        .pipe(concat('app.properties.js'))
        //.pipe(cleanDest('www/build/js'))
        .pipe(gulp.dest('www/build/js'));

    gulp.src(ionicPath.angularJS)
        .pipe(concat('app.js'))
        //.pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(gulp.dest('www/build/js'));

    gulp.src(ionicPath.nativeJS)
        .pipe(concat('native.js'))
        //.pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(gulp.dest('www/build/js'));

    gulp.src(ionicPath.languageJS)
        .pipe(concat('language.js'))
        //.pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(gulp.dest('www/build/js'));

    gulp.src(ionicPath.css)
        .pipe(cleanDest('www/css'))
        .pipe(gulp.dest('www/css'));

    gulp.src(ionicPath.templateHTML)
        .pipe(cleanDest('www/templates'))
        .pipe(gulp.dest('www/templates'));


    gulp.src(ionicPath.img)
        .pipe(cleanDest('www/img'))
        .pipe(gulp.dest('www/img'));

    gulp.src(ionicPath.font)
        .pipe(cleanDest('www/font'))
        .pipe(gulp.dest('www/font'));
}

//=======================================task ===================================================//
gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

gulp.task('cordova-install-plugin',function(){
    execCordovaPlugin();

});

//buid
gulp.task('ionic-build',function(){

    console.log(
        "prepairing ionic application "+
        "\n @author akbar.pambudi"
    );

    //bower.commands.install()
    // .on('log', function(data) {
    //   gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    // });
    execNpmInstall();
    execCordovaPlugin();
    execGenerateFile();


});

//generate file from app
gulp.task('ionic-generate',function(){
    console.log(
        "prepairing ionic application "+
        "\n @author akbar.pambudi"
    );

    execGenerateFile();
});

gulp.task('ionic-serve',function(){
    execGenerateFile();
    gulp.watch(ionicPath.angularJS,['ionic-generate']);
    gulp.watch(ionicPath.propertiesJS,['ionic-generate']);
    gulp.watch(ionicPath.scss,['ionic-generate']);
    gulp.watch(ionicPath.templateHTML,['ionic-generate']);
    gulp.src("package.json")
        .pipe(shell(['ionic serve'],{
            f: function (s) {
                return s.replace(/$/, '.bak')
            }
            ,ignoreErrors:true
        }));
})
