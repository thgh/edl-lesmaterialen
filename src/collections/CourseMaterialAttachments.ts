import { join } from 'path'
import { CollectionConfig } from 'payload'

export const CourseMaterialAttachments: CollectionConfig = {
  slug: 'course-material-attachments',
  admin: {
    useAsTitle: 'alt',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
    hidden: true,
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: join(process.cwd(), 'uploads', 'course-material-attachments'),
  },
  fields: [
    {
      name: 'alt',
      label: 'Korte beschrijving',
      type: 'text',
    },
  ],
}
