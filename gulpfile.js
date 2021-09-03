// seo関連で使えるタスク処理
// 1. sassコンパイル
// 2. jsのトランスコンパイル
// 3. js,cssのminify
// 4. 画像の圧縮
// 5. 画像のwebp変換

// gulpプラグインの読み込み
const { src, dest, watch, parallel } = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed');
const rename = require('gulp-rename');
const webp = require('gulp-webp');

// パス
const paths = {
    'root': './',
    'sassSrc': './src/sass/*.scss',
    'cssPublic': './public/css/',
    'jsSrc': './src/js/*.js',
    'jsPublic': './public/js/',
    'imgSrc': './src/img/**',
    'imgPublic': './public/img/',
}

const compileSass = () => {
    return src(paths.sassSrc)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) //minify
        .pipe(dest(paths.cssPublic));
};
const watchSassFiles = () => {
    watch(paths.sassSrc, compileSass);
};

const compileJs = () => {
    return src(paths.jsSrc)
        .pipe(babel({ presets: ['@babel/preset-env']}))
        .pipe(uglify())
        .pipe(dest(paths.jsPublic))
};
const watchJsFiles = () => {
    watch(paths.jsSrc, compileJs);
};

const compileImg = () => {
    return src(paths.imgSrc)
        .pipe(changed(paths.imgPublic))
        .pipe(
            imagemin([
                pngquant({
                    quality: [.60, .70], // 画質
                    speed: 1 // スピード
                }),
                mozjpeg({ quality: 65 }), // 画質
                imagemin.svgo(),
                imagemin.optipng(),
                imagemin.gifsicle({ optimizationLevel: 3 }) // 圧縮率
            ])
        )
        .pipe(dest(paths.imgPublic + '/'))
        .pipe(rename(function(path) {
            path.basename += path.extname; //同一名のファイルを区別するため 例）hoge.png, hoge.jpeg => hoge.png.png, hoge.jpeg.jpeg
        }))
        .pipe(webp())
        .pipe(dest(paths.imgPublic + '/'))
};
const watchImgFiles = () => {
    watch(paths.imgSrc, compileImg)
};

// npx gulp watch
exports.watch = parallel(watchSassFiles, watchJsFiles, watchImgFiles);

// 手動実行したいとき npx gulp build
exports.build = parallel(compileSass, compileJs, compileImg);