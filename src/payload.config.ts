// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Competences } from './collections/Competences'
import { CourseMaterialAttachments } from './collections/CourseMaterialAttachments'
import { CourseMaterials } from './collections/CourseMaterials'
import { MaterialTypes } from './collections/MaterialTypes'
import { SchoolTypes } from './collections/SchoolTypes'
import { Topics } from './collections/Topics'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  defaultDepth: 0,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    CourseMaterials,

    CourseMaterialAttachments,
    MaterialTypes,
    Competences,
    SchoolTypes,
    Topics,

    Users,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
