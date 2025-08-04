import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Beheer',
  },
  auth: true,
  fields: [
    {
      label: 'Naam',
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
