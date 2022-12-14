const {
  src,
  dest,
  series,
  watch
} = require('gulp');
const concat = require('gulp-concat');
// const htmlMin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-imagemin');
const webp = require ('gulp-webp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const fileInclude = require('gulp-file-include');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
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

const vendorStyles = () => {
  return src('./src/scss/vendor/*.css')
  .pipe(concat('vendor.css'))
  .pipe(dest('dist/styles'))
}

const htmlInclude = () => {
  return src(['./src/*.html'])
  .pipe(fileInclude({
    prefix: '@',
    basepath: '@file'
  }))
  .pipe(dest('./dist'))
  .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/img/**/*.svg')
  .pipe(
    svgmin({
      js2svg: {
        pretty: true,
      },
    })
  )
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
	src('./src/js/vendor/**.js')
		.pipe(concat('vendor.js'))
		.pipe(dest('./dist/js/'))
  return src(
    ['./src/js/components/**.js',
    './src/js/main.js'])
		.pipe(babel({
			presets: ['@babel/env']
		}))
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream())
}

const images = () => {
  src('./src/img/favicons/')
		.pipe(dest('./dist/img/favicons'))
  return src([
      'src/img/**/*.jpg',
      'src/img/**/*.jpeg',
      'src/img/**/*.png',
      'src/img/*.svg'
    ])
    .pipe(image())
    .pipe(dest('dist/img'))
}

const webpImages = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.jpeg',
    'src/img/**/*.png'
  ])
    .pipe(webp())
    .pipe(dest('dist/img'))
};

// const htmlMinify = () => {
//   return src('src/**/*.html')
//     .pipe(htmlMin({
//       collapseWhitespace: true,
//     }))
//     .pipe(dest('dist'))
// }

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

watch('./src/partials/*.html', htmlInclude);
watch('./src/*.html', htmlInclude);
watch('src/scss/vendor/*.css', vendorStyles);
watch('src/scss/**/*.scss', styles);
watch('src/img/svg/**/*.svg', svgSprites);
watch('src/js/**/*.js', scripts);
watch('src/resources/**', resources);
watch('src/fonts/**', fonts);

const toProd = (done) => {
  isProd = true;
  done();
};

exports.default = series(clean, htmlInclude, resources, fonts, scripts, vendorStyles, styles, images, webpImages, svgSprites, watchFiles);
exports.build = series(toProd, clean, htmlInclude, scripts, resources, fonts, vendorStyles, styles, images, webpImages, svgSprites);
