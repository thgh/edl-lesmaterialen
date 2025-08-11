import { getDictionary } from '@/i18n/dictionaries'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { MaterialsExplorer } from '../components/MaterialsExplorer'
import '../styles.css'

export const revalidate = 1
export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ lang: 'nl' | 'de' }> }) {
  const p = await params
  const lang = p.lang === 'de' ? 'de' : 'nl'
  const dict = getDictionary(lang)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch course materials
  const materialsResponse = await payload.find({
    collection: 'course-materials',
    where: {
      status: { not_equals: 'draft' },
    },
    limit: 9999,
  })

  // Fetch material types for filtering
  const [materialTypesResponse, schoolTypesResponse, competencesResponse, topicsResponse] =
    await Promise.all([
      payload.find({ collection: 'material-types' }),
      payload.find({ collection: 'school-types' }),
      payload.find({ collection: 'competences' }),
      payload.find({ collection: 'topics' }),
    ])

  const materials = materialsResponse.docs
  const materialTypes = materialTypesResponse.docs
  const schoolTypes = schoolTypesResponse.docs
  const competences = competencesResponse.docs
  const topics = topicsResponse.docs

  return (
    <MaterialsExplorer
      materials={materials as any}
      materialTypes={materialTypes as any}
      schoolTypes={schoolTypes as any}
      competences={competences as any}
      topics={topics as any}
      lang={lang}
      labels={{
        searchTitle: dict.searchTitle,
        searchPlaceholder: dict.searchPlaceholder,
        materialTypesTitle: dict.materialTypesTitle,
        schoolTypesTitle: dict.schoolTypesTitle,
        competencesTitle: dict.competencesTitle,
        topicsTitle: dict.topicsTitle,
        cefrLabel: dict.cefrLabel,
        languagesTitle: dict.languagesTitle,
        languageDutchLabel: dict.languageDutch,
        languageGermanLabel: dict.languageGerman,
        showFilters: dict.showFilters,
        hideFilters: dict.hideFilters,
      }}
    />
  )
}
