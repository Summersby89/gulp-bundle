const {
  src,
  dest,
  series,
  watch
} = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-imagemin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const del = require('del');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();

let isProd = false; // dev by default

const clean = () => {
  return del(['dist'])
}

const resources = () => {
  return src('src/resources/**')
    .pipe(dest('dist'))
}

const fonts = () => {
  return src('src/fonts/**')
    .pipe(dest('dist/fonts'))
}

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleancss({
      level: 2
    }))
    .pipe(gulpif(!isProd, sourcemaps.write()))
    .pipe(dest('dist/styles'))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true,
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/img/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/img'))
}

const scripts = () => {
  return src('./src/js/main.js')
    .pipe(webpackStream({
      mode: isProd ? 'production' : 'development',
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        }]
      },
      devtool: !isProd ? 'source-map' : false
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', notify.onError()))
    .pipe(sourcemaps.write())
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream())
}

// const scripts = () => {
//   return src([
//     'src/js/libs/**/*.js',
//     'src/js/main.js'
//   ])
//   .pipe(gulpif(isProd, sourcemaps.init()))
//   .pipe(babel({
//     presets: ['@babel/env']
//   }))
//   .pipe(concat('app.js'))
//   .pipe(gulpif(isProd, uglify().on('error', notify.onError())))
//   .pipe(gulpif(!isProd,sourcemaps.write()))
//   .pipe(dest('dist/js'))
//   .pipe(browserSync.stream())
// }

const images = () => {
  return src([
      'src/img/**/*.jpg',
      'src/img/**/*.jpeg',
      'src/img/**/*.png',
      'src/img/*.svg'
    ])
    .pipe(image())
    .pipe(dest('dist/img'))
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

const toProd = (done) => {
  isProd = true;
  done();
};

watch('src/**/*.html', htmlMinify);
watch('src/scss/**/*.scss', styles);
watch('src/img/svg/**/*.svg', svgSprites);
watch('src/js/**/*.js', scripts);
watch('src/resources/**', resources);
watch('src/fonts/**', fonts);

exports.styles = styles;
exports.htmlMinify = htmlMinify;

exports.default = series(clean, resources, fonts, htmlMinify, scripts, styles, images, svgSprites, watchFiles);
exports.build = series(toProd, clean, resources, fonts, htmlMinify, scripts, styles, images, svgSprites);
