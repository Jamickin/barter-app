// Shrink a phone photo before upload: a 4 MB camera picture becomes ~100 KB.
// Saves the uploader's data and everyone else's when they browse.
export function compressImage(file, maxSide = 1000, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      c.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // let the upload try the original
    }
    img.src = url
  })
}
