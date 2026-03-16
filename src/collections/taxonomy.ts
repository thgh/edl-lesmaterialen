import { CourseMaterial } from '@/payload-types'
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
      hooks: {
        beforeChange: [beforeChangeSlug('title_nl')],
      },
    },
  ],
}

export function createTaxonomy(
  options: Partial<CollectionConfig> & { slug: string },
  joinOn: keyof CourseMaterial,
): CollectionConfig {
  return {
    ...base,
    ...options,
    fields: joinOn
      ? [
          ...base.fields,
          {
            type: 'join',
            name: 'materials',
            collection: 'course-materials',
            on: joinOn,
            defaultLimit: 100,
            defaultSort: '-updatedAt',
            admin: {
              defaultColumns: ['title', 'slug', 'updatedAt'],
            },
          },
        ]
      : base.fields,
  }
}
