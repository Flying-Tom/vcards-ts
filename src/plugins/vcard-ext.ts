import fs from 'fs'
import yaml from 'js-yaml'
import { execSync } from 'child_process'
import { Buffer } from 'buffer'
import { PluginError } from 'gulp-util'
import Vinyl from 'vinyl'

import vCardsJS from 'vcards-js'
import addPhoneticField from '../utils/pinyin.js'

interface YamlData {
  basic: Record<string, any>
}

/**
 * Gulp 插件函数，用于将 YAML 转为 VCF 格式，并注入拼音与 REV 时间戳
 */
const plugin = (file: Vinyl, _: any, cb: (err: Error | null, file?: Vinyl) => void): void => {
  const path = file.path
  try {
    const data = fs.readFileSync(path, 'utf8')
    const json = yaml.load(data) as YamlData

    if (!json || !json.basic) {
      throw new Error(`Invalid YAML format in ${path}: Missing 'basic' field.`)
    }

    const vCard = vCardsJS()
    vCard.isOrganization = true

    // 设置基本字段
    for (const [key, value] of Object.entries(json.basic)) {
      (vCard as any)[key] = value
    }

    if (!vCard.uid) {
      vCard.uid = vCard.organization
    }

    // 插入图片
    const imagePath = path.replace('.yaml', '.png')
    if (fs.existsSync(imagePath)) {
      vCard.photo.embedFromFile(imagePath)
    }

    // 获取 git 修改时间（去除时区）
    const getLastChange = (filePath: string): Date => {
      try {
        const output = execSync(`git log -1 --pretty="format:%ci" "${filePath}"`)
          .toString()
          .trim()
          .replace(/\s\+\d+/, '')
        return output ? new Date(output) : new Date()
      } catch (e) {
        return new Date()
      }
    }

    const yamlDate = getLastChange(path)
    const pngDate = getLastChange(imagePath)
    const revDate = new Date(Math.max(yamlDate.getTime(), pngDate.getTime()))
    const rev = revDate.toISOString()

    // 构建 VCF 内容
    let formatted = vCard.getFormattedString()
    formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, `REV:${rev}`)
    formatted = addPhoneticField(formatted, 'ORG')

    file.contents = Buffer.from(formatted, 'utf-8')
    cb(null, file)
  } catch (err) {
    cb(new PluginError('plugin-vcard-ext', `${(err as Error).message} at ${path}`))
  }
}

export default plugin
