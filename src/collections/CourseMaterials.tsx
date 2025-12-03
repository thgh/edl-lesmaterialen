import { CollectionConfig, FieldAccess, RelationshipField } from 'payload'
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
      name: 'link',
      type: 'text',
      label: 'Link',
    },
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
      hidden: true,
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
      name: 'license',
      label: 'Licentie',
      type: 'text',
    },
    {
      name: 'contact',
      label: 'Contactgegevens',
      type: 'text',
      admin: {
        description: 'E-mailadres, link of naam van contactpersoon',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Uitgelicht',
      defaultValue: false,
    },

    {
      label: 'ERK-niveaus',
      name: 'cefr',
      type: 'select',
      hasMany: true,
      options: CEFRLevels,
      admin: { position: 'sidebar' },
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
      admin: { position: 'sidebar' },
    },
    {
      type: 'relationship',
      label: 'Schooltype',
      name: 'schoolType',
      relationTo: 'school-types',
      hasMany: true,
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
}
