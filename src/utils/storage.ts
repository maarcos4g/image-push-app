const LOCALSTORAGE_KEY = '@lastUploads'

export function getLastUploads(): string[] {
  const lastUploads = localStorage.getItem(LOCALSTORAGE_KEY)

  if (!lastUploads) {
    return []
  }

  return JSON.parse(lastUploads)
}

export function addLastUpload(fileURL: string) {
  const lastUploads = getLastUploads()

  if (lastUploads.includes(fileURL)) {
    return
  }

  lastUploads.unshift(fileURL)

  if (lastUploads.length > 3) {
    lastUploads.pop()
  }

  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(lastUploads))
}

export function clearLastUploads() {
  localStorage.removeItem(LOCALSTORAGE_KEY)
}