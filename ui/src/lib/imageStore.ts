/**
 * IndexedDB storage for uploaded images
 * Stores readable-size images (800px) with automatic cleanup when over limit
 */

const DB_NAME = 'route-dog-images'
const DB_VERSION = 1
const STORE_NAME = 'images'
const MAX_STORAGE_BYTES = 50 * 1024 * 1024 // 50MB limit

interface StoredImage {
  id: string
  data: string // base64 data URL
  size: number // bytes
  createdAt: string
}

let dbPromise: Promise<IDBDatabase> | null = null

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })

  return dbPromise
}

/**
 * Store an image in IndexedDB
 */
export async function storeImage(id: string, dataUrl: string): Promise<void> {
  const db = await getDB()
  const size = dataUrl.length // Approximate size in bytes

  // Check if we need to clean up old images
  await enforceStorageLimit(size)

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const image: StoredImage = {
      id,
      data: dataUrl,
      size,
      createdAt: new Date().toISOString(),
    }

    const request = store.put(image)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get an image from IndexedDB
 */
export async function getImage(id: string): Promise<string | null> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result as StoredImage | undefined
      resolve(result?.data ?? null)
    }
  })
}

/**
 * Delete an image from IndexedDB
 */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get total storage used
 */
async function getTotalStorageUsed(): Promise<number> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const images = request.result as StoredImage[]
      const total = images.reduce((sum, img) => sum + img.size, 0)
      resolve(total)
    }
  })
}

/**
 * Enforce storage limit by deleting oldest images
 */
async function enforceStorageLimit(incomingSize: number): Promise<void> {
  const currentUsage = await getTotalStorageUsed()

  if (currentUsage + incomingSize <= MAX_STORAGE_BYTES) {
    return // Under limit, nothing to do
  }

  const db = await getDB()

  // Get all images sorted by creation date (oldest first)
  const images = await new Promise<StoredImage[]>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('createdAt')
    const request = index.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as StoredImage[])
  })

  // Delete oldest images until we have enough space
  let freedSpace = 0
  const spaceNeeded = (currentUsage + incomingSize) - MAX_STORAGE_BYTES

  for (const image of images) {
    if (freedSpace >= spaceNeeded) break

    await deleteImage(image.id)
    freedSpace += image.size
    console.log(`[imageStore] Deleted old image ${image.id} to free ${image.size} bytes`)
  }
}

/**
 * Create a grayscale WebP image at specified max dimension
 */
export function processImage(
  file: File,
  maxSize: number,
  quality: number = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
      const img = new Image()
      img.src = reader.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          data[i] = gray     // R
          data[i + 1] = gray // G
          data[i + 2] = gray // B
          // Alpha unchanged
        }
        ctx.putImageData(imageData, 0, 0)

        // Export as WebP
        resolve(canvas.toDataURL('image/webp', quality))
      }

      img.onerror = reject
    }

    reader.onerror = reject
  })
}
