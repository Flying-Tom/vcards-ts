import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import through2 from 'through2'
import { Transform } from 'stream'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import concatFolders from 'gulp-concat'

import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'

// 类型补充：为了 TypeScript 能正确推导插件的流类型
const wrapPlugin = (plugin: any): Transform => {
  return through2.obj(plugin)
}

const generator = () => {
  return gulp
    .src('data/*/*.yaml')
    .pipe(wrapPlugin(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const generator_ext = () => {
  return gulp
    .src('data/*/*.yaml')
    .pipe(wrapPlugin(plugin_vcard_ext))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const archive = () => {
  return gulp.src('temp/**').pipe(zip('archive.zip')).pipe(gulp.dest('./public'))
}

const combine = () => {
  return gulp
    .src('temp/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const allinone = () => {
  return gulp.src('temp/汇总/*.all.vcf').pipe(concat('全部.vcf')).pipe(gulp.dest('./temp/汇总'))
}

const clean = () => {
  return deleteAsync(['public', 'temp'])
}

const createRadicale = () => {
  const folders = fs
    .readdirSync('temp')
    .filter((f) => fs.statSync(path.join('temp', f)).isDirectory())

  folders.forEach((folder) => {
    const folderPath = path.join('temp', folder)
    const fileCount = fs.readdirSync(folderPath).filter((file) => file.endsWith('.vcf')).length

    fs.writeFileSync(
      path.join(folderPath, '.Radicale.props'),
      JSON.stringify({
        'D:displayname': `${folder}(${fileCount})`,
        tag: 'VADDRESSBOOK',
      }),
    )
  })

  return gulp.src('temp/**')
}

const cleanRadicale = () => {
  return deleteAsync(['radicale'], { force: true })
}

const distRadicale = () => {
  return gulp.src('temp/**', { dot: true }).pipe(gulp.dest('./radicale/ios'))
}

const distRadicaleMacos = (done: gulp.TaskFunctionCallback) => {
  const allDir = './radicale/macos/全部'
  if (!fs.existsSync(allDir)) fs.mkdirSync(allDir, { recursive: true })

  let totalCount = 0
  const tempFolders = fs
    .readdirSync('temp')
    .filter((f) => fs.statSync(path.join('temp', f)).isDirectory())

  tempFolders.forEach((folder) => {
    const folderPath = path.join('temp', folder)
    const vcfFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith('.vcf'))

    vcfFiles.forEach((file) => {
      fs.copyFileSync(path.join(folderPath, file), path.join(allDir, file))
    })

    totalCount += vcfFiles.length
  })

  fs.writeFileSync(
    path.join(allDir, '.Radicale.props'),
    JSON.stringify({
      'D:displayname': `全部(${totalCount})`,
      tag: 'VADDRESSBOOK',
    }),
  )

  done()
}

const build = gulp.series(clean, generator, combine, allinone, archive)
const radicale = gulp.series(
  clean,
  generator_ext,
  createRadicale,
  cleanRadicale,
  gulp.parallel(distRadicale, distRadicaleMacos),
)

export { generator, generator_ext, combine, allinone, archive, build, radicale }
