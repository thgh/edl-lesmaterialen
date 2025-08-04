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
  (fallback: string, fallback2?: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (value && typeof value === 'string') {
      const afterSlugify = slugify(value)
      if (afterSlugify !== value) console.log('reslugify', value, afterSlugify)
      return afterSlugify
    }

    const fallbackData = (data && data[fallback]) || (originalDoc && originalDoc[fallback])
    if (fallbackData && typeof fallbackData === 'string') {
      return slugify(fallbackData)
    }

    const fallback2Data =
      fallback2 && ((data && data[fallback2]) || (originalDoc && originalDoc[fallback2]))
    if (fallback2Data && typeof fallback2Data === 'string') {
      return slugify(fallback2Data)
    }

    return value
  }
