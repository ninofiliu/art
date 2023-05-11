#!/bin/sh
path=./src/srcs.ts
echo 'export const srcs = [' >$path
echo public/**/*.* | fmt -w 0 | sed 's#^public#"#' | sed 's#$#",#' >>$path
echo ']' >>$path
npx prettier --write $path
