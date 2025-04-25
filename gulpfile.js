//* ===============================================
//# 静的サイト対応Gulp
//ver.2.1
//date:20250219
//=============================================== *//
import fs from "fs";
import path from "path";
import gulp from "gulp";
import browserSync from "browser-sync";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import notify from "gulp-notify";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssSorter from "css-declaration-sorter";
import cleanCSS from "gulp-clean-css";
import uglify from "gulp-uglify";
import mergeRules from "postcss-merge-rules";
import webp from "gulp-webp";
import replace from "gulp-replace";
import { deleteAsync } from "del";
import watch from "gulp-watch";
import gulpIf from "gulp-if";
import postcssUrl from "postcss-url";

const sass = gulpSass(dartSass);
const browserSyncInstance = browserSync.create();

//* ===============================================
//#Sassフォルダ構成に合わせて変更
//=============================================== *//
const scssDirs = ["layout", "component", "project", "utility", "foundation", "global"];
const baseDir = "./src/assets/sass/";

//* ===============================================
//# 共通のエラーハンドラ：エラー発生時にエラーメッセージを表示してプロセスを終了する
//=============================================== *//
function errorHandler(err) {
  console.error(err.message);
  process.exit(1);
}

//* ===============================================
//# Sassのパーシャルファイル自動生成
//指定フォルダ内のすべての .scss ファイルを自動で集めて、まとめて読み込むための index.scss を自動生成しています
//=============================================== *//
function generateIndexScss(done) {
  scssDirs.forEach((dir) => {
    const fullPath = path.join(baseDir, dir);
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      const files = fs
        .readdirSync(fullPath)
        .filter((file) => file.endsWith(".scss") && file !== "index.scss");
      const importStatements = files
        .map((file) => `@use "${file.replace(".scss", "")}";`)
        .join("\n");
      fs.writeFileSync(
        path.join(fullPath, "index.scss"),
        `/* Auto-generated index.scss for ${dir} */\n${importStatements}`
      );
    }
  });
  done();
}

//* ===============================================
//# Sass→を本番環境のCSSに変換して圧縮
//=============================================== *//
function compileSass() {
  return gulp
    .src(path.join(baseDir, "style.scss"), { base: baseDir })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "Sass Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(sass())
    .pipe(
      postcss([
        postcssUrl({
          url: (asset) => {
            return asset.url.replace(/\.\.\/\.\.\/img/g, "../img");
          },
        }),
      ])
    )
    .pipe(postcss([autoprefixer(), cssSorter(), mergeRules()]))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css/"))
    .pipe(browserSyncInstance.stream()) // ブラウザをストリームで更新
    .pipe(
      notify({
        message: "Sassをコンパイルして圧縮しました!",
      })
    );
}

//* ===============================================
//# スクリプトの圧縮
//=============================================== *//
function formatJS() {
  return gulp
    .src("./src/assets/js/**/*.js")
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "Sass Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest("./js/"))
    .pipe(browserSyncInstance.stream())
    .pipe(
      notify({
        message: "スクリプトをコンパイルして圧縮しました!",
      })
    );
}

//* ===============================================
//# 画像をWebP形式に変換し、元の画像を削除（svgは除外）
//copyImage()で使用。
//=============================================== *//
function isWebPConvertible(file) {
  return !file.extname.endsWith(".svg");
}
//* ===============================================
//# 画像の拡張子をWebpへ自動変換
//=============================================== *//
function copyImage() {
  return gulp
    .src("./src/assets/img/**/*.{png,jpg,jpeg,gif,svg}")
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "Sass Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(gulpIf(isWebPConvertible, webp()))
    .pipe(gulp.dest("./img/"))
    .pipe(browserSyncInstance.stream())
    .on("end", async () => {
      await deleteAsync(["./img/**/*.{png,jpg,jpeg,gif}"]); // SVGは削除しない
    });
}

//* ===============================================
//# HTML ファイル内の画像パスを .webp に置き換える
//=============================================== *//
function updateHtml() {
  return gulp
    .src("./**/*.html")
    .pipe(plumber({ errorHandler }))
    .pipe(replace(/\.(png|jpg|jpeg|gif)/g, ".webp"))
    .pipe(gulp.dest("./"))
    .pipe(browserSyncInstance.stream())
    .pipe(
      notify({
        message: "HTML updated with webp images",
      })
    );
}

//* ===============================================
//#各フォルダの監視
//=============================================== *//
function watchFiles() {
  watch(
    [baseDir + "**/*.scss", "!" + baseDir + "**/index.scss"],
    gulp.series(generateIndexScss, compileSass)
  );
  watch("./src/assets/js/**/*.js", gulp.series(formatJS));
  watch("./src/assets/img/**/*", gulp.series(copyImage));
  watch("./**/*.html").on("change", browserSyncInstance.reload);
}

//* ===============================================
//#ブラウザ監視
//=============================================== *//
function browserInit(done) {
  browserSyncInstance.init({
    server: {
      baseDir: "./",
    },
    notify: false,
  });
  done();
}

export const generateIndexScssTask = generateIndexScss;
export const compileSassTask = compileSass;
export const watchTask = watchFiles;
export const browserInitTask = browserInit;
export const formatJSTask = formatJS;
export const updateHtmlTask = updateHtml;
//コマンド登録
export const dev = gulp.parallel(browserInit, watchFiles);
export const build = gulp.parallel(
  formatJS,
  compileSass,
  copyImage,
  updateHtml
);
