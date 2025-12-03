import { randomBytes } from 'crypto'
import { CollectionSlug, FieldHook } from 'payload'

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
  async ({ value, originalDoc, data, collection, req }) => {
    const options = [
      () => value,
      () => data?.[fallback],
      () => originalDoc?.[fallback],
      () => fallback2 && data?.[fallback2],
      () => fallback2 && originalDoc?.[fallback2],
      () => randomBytes,
    ]

    let firstSlug = ''
    for (const generate of options) {
      const value = generate()
      if (typeof value !== 'string') continue
      const slug = slugify(value)
      if (!slug) continue
      if (!firstSlug) firstSlug = slug
      const exists = await req.payload.find({
        collection: collection?.slug as CollectionSlug,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!exists.docs.length) {
        console.log('new', slug, value)
        return slug
      }
      if (exists.docs[0].id === originalDoc?.id) {
        console.log('same', slug, value)
        return slug
      }
    }

    const random = randomBytes(4)
      .toString('base64url')
      .replaceAll('-', '')
      .replaceAll('_', '')
      .toLowerCase()
    console.log('random', firstSlug, random)
    if (firstSlug) return firstSlug + '-' + random
    return random
  }
