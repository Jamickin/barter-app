// Stand-in for 'firebase/storage'. Photos are shrunk on the device before "upload" —
// the same thing the real app should do to save people's mobile data.
import { getState, persist } from './db.js'

export const getStorage = () => ({ __demo: true })
export const ref = (_storage, path) => ({ fullPath: path })

export async function uploadBytes(fileRef, file) {
  const dataUrl = await shrinkImage(file, 900, 0.72)
  getState().files[fileRef.fullPath] = dataUrl
  persist()
  return { ref: fileRef }
}

export async function getDownloadURL(fileRef) {
  const url = getState().files[fileRef.fullPath]
  if (!url) throw Object.assign(new Error('File not found'), { code: 'storage/object-not-found' })
  return url
}

export async function deleteObject(fileRef) {
  delete getState().files[fileRef.fullPath]
  persist()
}

export function shrinkImage(file, maxSide, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }
    img.src = url
  })
}
