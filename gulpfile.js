var gulp = require("gulp");
var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf").sync;
var browserify = require("browserify");
var replaceExt = require("gulp-ext-replace");
var transform = require("gulp-transform");
var jade2react = require("jade2react");
var cp = require("child_process");
var babel = require("gulp-babel");
var babelify = require("babelify");
var es = require("event-stream");
var cache = new (require("gulp-file-cache"))();
var cacheApi = require("browserify-cache-api");

var serverProcess = null;

gulp.task("clean", function (cb) {
  rimraf("./lib");
  rimraf(".gulp-cache");
  fs.mkdirSync("./lib");
  cb();
});

gulp.task("compile", function () {
  return es
    .merge(
      gulp
        .src("src/**/*.jade")
        .pipe(cache.filter())
        .pipe(cache.cache())
        .pipe(replaceExt(".js"))
        .pipe(transform((code) => jade2react.compile(code.toString("utf8")))),
      gulp.src("src/**/*.js").pipe(cache.filter()).pipe(cache.cache())
    )
    .pipe(
      babel({
        presets: ["es2015"],
        plugins: ["syntax-async-functions", "transform-regenerator"],
      })
    )
    .pipe(gulp.dest("lib"));
});

gulp.task(
  "buildClient",
  gulp.series("compile", function (cb) {
    var bundle = browserify({
      basedir: path.resolve(__dirname, "../"),
      cache: {},
      packageCache: {},
      exposeAll: true,
      basedir: path.resolve(__dirname, "../"),
    });
    cacheApi(bundle, { cacheFile: "./cache.json" });
    bundle.require(require.resolve("./lib/app"));
    bundle.transform(
      babelify.configure({
        presets: ["es2015"],
        extensions: [".js"],
        babelrc: false,
        ignore: /^((?!(bicon|route-system)).)*$/,
      }),
      { global: true }
    );
    bundle.bundle((err, build) => {
      if (err) return cb(err);
      fs.writeFileSync("./lib/main.js", build);
      cb();
    });
  })
);

gulp.task(
  "buildServer",
  gulp.series("compile", function (cb) {
    cb();
  })
);

gulp.task("build", gulp.series("buildServer", "buildClient"));

gulp.task(
  "start",
  gulp.series("build", function (cb) {
    if (serverProcess) serverProcess.kill();
    serverProcess = cp.spawn("node", ["start"]);
    serverProcess.stdout.pipe(process.stdout);
    serverProcess.stderr.pipe(process.stderr);
    cb();
  })
);

gulp.task(
  "watch",
  gulp.series("start", function (cb) {
    gulp.watch(["./src/**"], gulp.series("start"));
  })
);
