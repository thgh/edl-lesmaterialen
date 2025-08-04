import { CollectionConfig } from 'payload'
import { hiddenTitle, localizedTitle } from './field'
import { beforeChangeSlug } from './formatSlug'

const base: Omit<CollectionConfig, 'slug'> = {
  admin: {
    useAsTitle: 'title',
    hideAPIURL: true,
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Taxonomieën',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
  },
  access: {
    read: () => true,
  },
  fields: [
    hiddenTitle,
    localizedTitle,
    {
      type: 'text',
      name: 'slug',
      label: 'Slug',
      unique: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeChange: [beforeChangeSlug('title_nl')],
      },
    },
  ],
}

export function createTaxonomy(
  options: Partial<CollectionConfig> & { slug: string },
): CollectionConfig {
  return { ...base, ...options }
}
