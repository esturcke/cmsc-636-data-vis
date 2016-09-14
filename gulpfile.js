const gulp  = require("gulp")
const shell = require("gulp-shell")

const cwd = process.env.INIT_CWD

gulp.task("serve", shell.task(`serve -o -p 8080 "${cwd}"`))

gulp.task("gist", shell.task(`./bin/gist-it "${cwd}"`))
