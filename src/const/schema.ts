import Joi, { CustomHelpers } from 'joi'
import libPhoneNumber from 'google-libphonenumber'
import { CustomValidator } from 'joi'

const { PhoneNumberUtil } = libPhoneNumber;
const phoneUtil = PhoneNumberUtil.getInstance()

/**
 * 检查手机号是否合法
 * @param phone 任意类型的手机号
 * @returns 是否有效
 */
const checkPhone = (phone: unknown): boolean => {
  let phoneStr = String(phone)

  // 移除形如 +86 开头的国际码前缀（如果后面还有空格）
  if (/^\+\d+ /.test(phoneStr)) {
    phoneStr = phoneStr.replace(/^\+\d+ /, '')
  }

  // 全是数字，认为合法
  if (/^\d+$/.test(phoneStr)) {
    return true
  }

  try {
    const number = phoneUtil.parseAndKeepRawInput(phoneStr, 'CN')
    return phoneUtil.isValidNumber(number)
  } catch (e) {
    return false
  }
}


// 自定义 Joi 校验器
const phoneValidator: CustomValidator<string> = (value, helpers) => {
  if (!checkPhone(value)) {
    return helpers.error('phone is incorrect')
  }
  return value
}

// 构建 schema
const schema = Joi.object({
  basic: Joi.object({
    organization: Joi.string().required(),
    cellPhone: Joi.array()
      .items(
        Joi.string().custom(phoneValidator),
        Joi.number() // number 类型作为兼容（也可以转 string 后再验证）
      )
      .optional(),
    url: Joi.string().uri().optional(),
    workEmail: Joi.array().items(Joi.string().email()).optional()
  }).required()
})

export default schema
