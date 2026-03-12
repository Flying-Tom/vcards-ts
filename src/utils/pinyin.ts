import { pinyin } from 'pinyin-pro'

/**
 * 给指定字段添加 X-PHONETIC- 字段（用于 vCard 拼音支持）
 * @param text vCard 文本内容
 * @param fieldName 字段名，例如 FN、N
 * @returns 添加拼音字段后的 vCard 文本
 */
const addPhoneticField = (text: string, fieldName: string): string => {
  const regex = new RegExp(`${fieldName};CHARSET=UTF-8:(.*)\r?\n`, 'g')

  return text.replace(regex, (match: string, value: string): string => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(value)

    const pinyinText = hasChinese
      ? pinyin(value, {
          toneType: 'none',
          nonZh: 'consecutive',
          type: 'array'
        })
          .map((item: string) => item.charAt(0).toUpperCase() + item.slice(1))
          .join(' ')
      : value

    return `${match}X-PHONETIC-${fieldName};CHARSET=UTF-8:${pinyinText}\n`
  })
}

export default addPhoneticField
