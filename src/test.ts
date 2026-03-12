import fs from 'fs'
import test, { ExecutionContext } from 'ava'
import { globby } from 'globby'
import yaml from 'js-yaml'
import { readChunkSync } from 'read-chunk'
import imageSize from 'image-size'
import prettyBytes from 'pretty-bytes'

import isPng from './utils/isPng.js'
import blockList from './const/block.js'
import schema from './const/schema.js'

// 为 AVA 的 t 参数指定类型
const checkImage = (t: ExecutionContext, imagePath: string): void => {
  const buffer = readChunkSync(imagePath, {
    startPosition: 0,
    length: 8,
  })

  if (!isPng(buffer)) {
    t.fail('图片格式不合法')
  }

  const dimensions = imageSize(imagePath)
  if (dimensions.width !== 200 || dimensions.height !== 200) {
    t.fail(`图片尺寸不合法 ${dimensions.width}x${dimensions.height}`)
  }

  const stats = fs.lstatSync(imagePath)
  if (stats.size > 1024 * 20) {
    t.fail(`图片文件体积超过限制 ${prettyBytes(stats.size)}`)
  }

  t.pass()
}

const checkVCard = (t: ExecutionContext, yamlPath: string): void => {
  const data = fs.readFileSync(yamlPath, 'utf8')
  const json = yaml.load(data)

  // 检查 schema
  const { value, error } = schema.validate(json)
  if (error) {
    t.fail(`schema 校验失败 ${error.message}, ${JSON.stringify(value)}`)
  }

  for (const block of blockList) {
    if (block.organization === (json as any)?.basic?.organization) {
      t.fail(`不收录 ${block.organization}，原因：${block.reason}`)
    }
  }

  t.pass()
}

const app = async () => {
  const paths = await globby('data/*/*.yaml')
  for (const yamlPath of paths) {
    const parts = yamlPath.split('/')
    const type = parts[1]
    const name = parts[2].replace(/\.yaml$/, '')
    const imagePath = `data/${type}/${name}.png`

    test(`Image/${type}/${name}`, checkImage, imagePath)
    test(`vCard/${type}/${name}`, checkVCard, yamlPath)
  }
}

app()
