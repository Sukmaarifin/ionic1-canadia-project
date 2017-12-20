@echo off
for %%a in (
 "gulp"
 "bower"
 "gulp-concat"
 "gulp-sass"
 "gulp-minify-css"
 "gulp-rename"
 "shelljs"
 "gulp-dest-clean"
 "gulp-uglify"
 "gulp-shell"
) do npm install %%a