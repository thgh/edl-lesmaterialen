import { FieldHook } from 'payload'

export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(' - ', '-')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-_]+/g, '')
    .replace(/_+/g, '_')
    .replace(/--+/g, '-')
}

export const beforeChangeSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (value && typeof value === 'string') {
      return slugify(value)
    }

    const fallbackData = (data && data[fallback]) || (originalDoc && originalDoc[fallback])
    if (fallbackData && typeof fallbackData === 'string') {
      return slugify(fallbackData)
    }

    return value
  }
