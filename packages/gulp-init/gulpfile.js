const { src, dest, series, watch } = require("gulp");
const less = require("gulp-less");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const when = require("gulp-if");
const minifyCss = require("gulp-clean-css");
const minifyImages = require("gulp-imagemin");
const browserSync = require("browser-sync").create();

const outputDir = "./dist";
const proxy = "wes-1903--ccn-initial-rework.dd:8083"; // Path the site is served on for local development 
const build = series(css, js, images);

let isServing = false;



// Gulp Tasks
function css() {
  return src("./src/less/_imports.less")
    .pipe(plumber())
    .pipe(less())
    // .pipe(plumber())
    .pipe(when(!isServing, minifyCss()))
    .pipe(rename("styles.css"))
    .pipe(dest(outputDir))
    .pipe(when(isServing, browserSync.stream()));
}
function js() {
  return src("./src/js/scripts.js")
    .pipe(dest(outputDir));
}
function images(done) {
  return src("./src/images/*")
    .pipe(minifyImages())
    .pipe(dest(outputDir + "/images"));
}
function reload(done) {
  browserSync.reload();
  done();
}
function serve() {
  isServing = true;
  browserSync.init({ 
    proxy/*,
    files: outputDir + "/images/*.{png,jpg,jpeg,gif,svg}"*/
  });
  watch(["./src/less/**/*"], css);
  watch(["./src/images/**/*"], series(images, reload));
  watch(["./src/js/scripts.js"], series(js, reload));
}


// Gulp interface
module.exports = {
  default: build,
  build,
  serve: series(build, serve)
};