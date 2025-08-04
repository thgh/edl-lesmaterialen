import { CourseMaterial } from '@/payload-types'
import {
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldAccess,
  RelationshipField,
} from 'payload'
import { CEFRLevels } from './CEFRLevels'
import { hiddenTitle, localize, localizedTitle } from './field'
import { beforeChangeSlug } from './formatSlug'

export const taxonomy: Omit<RelationshipField, 'name' | 'relationTo'> = {
  type: 'relationship',
  admin: { position: 'sidebar' },
}

export const materialStatusOptions = [
  { label: 'Concept', value: 'draft' } as const,
  { label: 'Gepubliceerd', value: 'published' } as const,
]

const baseElements = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'ul',
  'ol',
  'link',
  'relationship',
  'upload',
  'indent',
  'textAlign',
] as const

export const CourseMaterials: CollectionConfig = {
  slug: 'course-materials',
  labels: {
    singular: 'Lesmateriaal',
    plural: 'Lesmaterialen',
  },
  admin: {
    useAsTitle: 'title',
    preview: (data) => (data.slug ? '/lesmateriaal/' + data.slug : '/lesmateriaal/id:' + data.id),
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'active' } }),
  },
  fields: [
    hiddenTitle,
    localizedTitle,
    localize({
      name: 'description',
      label: 'Beschrijving',
      type: 'textarea',
    }),

    {
      name: 'attachments',
      label: 'Bijlages',
      type: 'upload',
      relationTo: 'course-material-attachments',
      hasMany: true,
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        localize({
          name: 'label',
          label: 'Naam link',
          type: 'text',
        }),
        {
          name: 'url',
          label: 'Link',
          type: 'text',
        },
      ],
    },

    {
      type: 'relationship',
      label: 'Schooltype',
      name: 'schoolType',
      relationTo: 'school-types',
      admin: { position: 'sidebar' },
    },
    {
      type: 'relationship',
      label: 'Competenties',
      name: 'competences',
      relationTo: 'competences',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'relationship',
      label: 'Onderwerp',
      name: 'topics',
      relationTo: 'topics',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'relationship',
      label: 'Materiaalsoort',
      name: 'materialTypes',
      relationTo: 'material-types',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      label: 'ERK-niveaus',
      name: 'cefr',
      type: 'select',
      hasMany: true,
      options: CEFRLevels,
    },
    {
      label: 'Taal',
      name: 'language',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'Duits', value: 'de' },
        { label: 'Engels', value: 'en' },
      ],
    },
    // {
    //   ...taxonomy,
    //   label: 'Onderwijsvorm',
    //   name: 'level',
    //   relationTo: 'education-types',
    //   hasMany: true,
    //   required: true,
    // },
    // {
    //   ...taxonomy,
    //   label: 'Vaardigheid',
    //   name: 'skill',
    //   relationTo: 'course-material-skills',
    //   hasMany: true,
    //   required: true,
    // },
    // {
    //   ...taxonomy,
    //   label: 'Type',
    //   name: 'type',
    //   relationTo: 'course-material-types',
    //   hasMany: true,
    //   required: true,
    // },
    // {
    //   ...taxonomy,
    //   label: 'Regio',
    //   name: 'region',
    //   relationTo: 'course-material-regions',
    //   hasMany: true,
    //   required: true,
    // },

    // Sidebar
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: materialStatusOptions,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [beforeChangeSlug('title_nl', 'title_de')],
      },
    },
    {
      label: 'Interne notities',
      name: 'notes',
      type: 'textarea',
      access: {
        read: (({ req }) => !!req.user) as FieldAccess,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      (async ({ operation, data, req }) => {
        if (operation === 'create' || !data.user) {
          console.log('course material beforeChange', data.user, req.user?.id)
          if (req.user) data.user = req.user.id
        }

        return data
      }) as CollectionBeforeChangeHook<CourseMaterial>,
    ],
  },
}
