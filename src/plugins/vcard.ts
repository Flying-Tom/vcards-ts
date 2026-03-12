import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import Vinyl from 'vinyl'
import addPhoneticField from '../utils/pinyin.js'

interface YamlData {
  basic: Record<string, any>
}

/**
 * Gulp 插件：读取 YAML，生成 VCF，并过滤非法手机号
 */
const plugin = (file: Vinyl, _: any, cb: (error: Error | null, file?: Vinyl) => void): void => {
  try {
    const path = file.path
    const data = fs.readFileSync(path, 'utf8')
    const json = yaml.load(data) as YamlData

    if (!json || !json.basic) {
      throw new Error(`Invalid YAML format in ${path}: Missing 'basic' field.`)
    }

    const vCard = vCardsJS()

    vCard.isOrganization = true

    // 赋值基本字段
    for (const [key, value] of Object.entries(json.basic)) {
      ;(vCard as any)[key] = value
    }

    // 过滤掉 106 开头 且长度 > 11 的号码
    if (Array.isArray(vCard.cellPhone)) {
      vCard.cellPhone = vCard.cellPhone.filter((phone: any) => {
        const phoneStr = String(phone)
        return !phoneStr.startsWith('106') || phoneStr.length <= 11
      })
    }

    // 嵌入头像
    const imagePath = path.replace('.yaml', '.png')
    if (fs.existsSync(imagePath)) {
      vCard.photo.embedFromFile(imagePath)
    }

    // 获取 vCard 字符串并添加拼音字段
    let formatted = vCard.getFormattedString()
    formatted = addPhoneticField(formatted, 'ORG')

    // 写入内容
    file.contents = Buffer.from(formatted, 'utf8')
    cb(null, file)
  } catch (err) {
    cb(err as Error)
  }
}

export default plugin
