// 图片处理：本地压缩后转 dataURL 存储，成品不超过约 1.6MB（base64 膨胀后 < 2MB 限制）
const MAX_BYTES = 1.6 * 1024 * 1024

/** 读取 File → 压缩 → JPEG dataURL */
export function compressImage(file, { maxDim = 1920 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      render(img, maxDim).then(resolve, () => reject(new Error('图片过大，压缩后仍超过 2MB')))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('图片读取失败'))
    }
    img.src = objectUrl
  })

  // 逐级降低质量 / 尺寸直到满足大小限制
  async function render(img, maxDim) {
    let dim = maxDim
    for (let round = 0; round < 4; round++) {
      const scale = Math.min(1, dim / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      for (const q of [0.85, 0.72, 0.6, 0.45]) {
        const url = canvas.toDataURL('image/jpeg', q)
        // base64 实际字节约为字符串长度的 3/4
        if (url.length * 0.75 <= MAX_BYTES) return url
      }
      dim = Math.round(dim * 0.75)
    }
    throw new Error('图片过大，压缩后仍超过 2MB')
  }
}

/** 批量压缩（保持顺序） */
export async function compressImages(files, opts) {
  const urls = []
  for (const f of files) urls.push(await compressImage(f, opts))
  return urls
}
