export const getStableAccountNumber = (key: string, length = 8) => {
  const normalizedKey = key.trim().toLowerCase()

  if (!normalizedKey || normalizedKey === 'n/a') {
    return '100379620'.slice(0, length)
  }

  let hash = 0
  for (let i = 0; i < normalizedKey.length; i++) {
    hash = (hash * 31 + normalizedKey.charCodeAt(i)) >>> 0
  }

  let digits = ''
  let seed = hash || 100379620
  while (digits.length < length) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    digits += seed.toString().padStart(10, '0')
  }

  return digits.slice(0, length)
}
