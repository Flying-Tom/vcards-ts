/**
 * 判断给定的缓冲区是否为 PNG 文件头
 * @param buffer 二进制缓冲数据
 * @returns 是否为 PNG 格式
 */
const isPng = (buffer: Buffer<ArrayBufferLike>) => {
  if (!buffer || buffer.length < 8) {
    return false
  }

  return (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  )
}

export default isPng
