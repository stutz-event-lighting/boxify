var gulp = require("gulp");
var fs = require("fs");
var rimraf = require("rimraf").sync;
var browserify = require("browserify");
var replaceExt = require("gulp-ext-replace");
var transform = require("gulp-transform");
var jade2react = require("jade2react");
var cp = require("child_process");

gulp.task("clean",function(){
	rimraf("./lib");
	fs.mkdirSync("./lib");
});

gulp.task("compileJade",["clean"],function(){
	return gulp
		.src("src/**/*.jade")
		.pipe(replaceExt(".js"))
		.pipe(transform((code)=>jade2react.compile(code.toString("utf8"))))
		.pipe(gulp.dest("lib"));
});
gulp.task("copyJs",["clean"],function(){
	return gulp
		.src("src/**/*.js")
		.pipe(gulp.dest("lib"));
})

gulp.task("buildClient",["compileJade","copyJs"],function(cb){
	var bundle = browserify();
	bundle.add(require.resolve("./lib/app"));
	bundle.bundle((err,build)=>{
		if(err) return cb(err);
		fs.writeFileSync("./lib/main.js",build);
		cb();
	});
});

gulp.task("buildServer",["compileJade","copyJs"],function(cb){
	cb();
});

gulp.task("build",["buildClient","buildServer"],function(){
});

gulp.task("start",["build"],function(cb){
	var p = cp.spawn("node",["start"]);
	p.stdout.pipe(process.stdout);
	p.stderr.pipe(process.stderr);
});
