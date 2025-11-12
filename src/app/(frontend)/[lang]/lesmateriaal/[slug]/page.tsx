import { getDictionary } from '@/i18n/dictionaries'
import { CourseMaterial, CourseMaterialAttachment } from '@/payload-types'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Footer } from '../../../components/Footer'
import { MaterialNavigation } from '../../../components/MaterialNavigation'
import { Sidebar } from '../../../components/Sidebar'
import '../../../styles.css'
import { renderTextWithEmailLinks } from '../../../utils/text'

export const dynamic = 'force-dynamic'

// PDF Embed Component
function PDFEmbed({ url }: { url: string }) {
  const proxyUrl = url.startsWith('http') ? `/api/pdf-proxy?url=${encodeURIComponent(url)}` : url

  return (
    <div className="mt-3 mb-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <iframe src={proxyUrl} className="w-full h-screen" title="PDF Document" frameBorder="0" />
      </div>
    </div>
  )
}

type Params = { lang: 'nl' | 'de'; slug: string }
type SearchParams = {
  q?: string
  types?: string
  schoolTypes?: string
  competences?: string
  topics?: string
  langs?: string
}

async function fetchMaterialBySlugOrId(slugOrId: string) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  if (slugOrId.startsWith('id:')) {
    const id = slugOrId.slice(3)
    try {
      const doc = await payload.findByID({ collection: 'course-materials', id, depth: 1 })
      return doc as unknown as CourseMaterial | null
    } catch {
      return null
    }
  }

  const res = await payload.find({
    collection: 'course-materials',
    where: {
      and: [{ slug: { equals: slugOrId } }, { status: { not_equals: 'draft' } }],
    },
    limit: 1,
    depth: 1,
  })
  return (res.docs?.[0] as unknown as CourseMaterial) || null
}

async function fetchAllMaterials() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'course-materials',
    where: {
      status: { not_equals: 'draft' },
    },
    limit: 9999,
    sort: '-createdAt',
  })

  return res.docs as unknown as CourseMaterial[]
}

function getLocalized<T extends { title_nl?: string | null; title_de?: string | null }>(
  obj: T | string | null | undefined,
  locale: 'nl' | 'de',
) {
  if (!obj || typeof obj === 'string') return ''
  return (locale === 'de' ? obj.title_de : obj.title_nl) || obj.title_nl || obj.title_de || ''
}

export default async function CourseMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const p = await params
  const sp = await searchParams
  const lang = p.lang === 'de' ? 'de' : 'nl'
  const dict = getDictionary(lang)

  // Fetch current material and all materials for navigation
  const [material, allMaterials] = await Promise.all([
    fetchMaterialBySlugOrId(p.slug),
    fetchAllMaterials(),
  ])

  if (!material) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-gray-600">Not found</p>
        <Link href={`/${lang}`} className="mt-4 inline-block text-blue-600 hover:underline">
          {dict.detailBackToOverview}
        </Link>
      </main>
    )
  }

  // Parse filter parameters from URL
  const filters = {
    searchQuery: sp.q || '',
    selectedTypes: sp.types
      ? sp.types
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    selectedSchoolTypes: sp.schoolTypes
      ? sp.schoolTypes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    selectedCompetences: sp.competences
      ? sp.competences
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    selectedTopics: sp.topics
      ? sp.topics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    selectedLanguages: sp.langs
      ? sp.langs
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  }

  const title =
    (lang === 'de' ? material.title_de : material.title_nl) ||
    material.title_de ||
    material.title_nl ||
    material.title ||
    'Untitled'

  // Use the same thumbnail logic as the card component
  const thumbnail = ((material.attachments as CourseMaterialAttachment[]) || []).find(
    (a) => a && typeof a === 'object' && a.mimeType?.startsWith('image/'),
  )

  const hasImageHero = !!thumbnail

  const externalLinks = material.links || []
  const hasExternalOnly =
    externalLinks.length > 0 && (!material.attachments || material.attachments.length === 0)

  const cefr = material.cefr?.join(', ')

  const pdfLinks = externalLinks.filter((lnk) => lnk.url?.toLowerCase().endsWith('.pdf'))

  // Get PDF attachments for embedding
  const pdfAttachments = Array.isArray(material.attachments)
    ? material.attachments.filter((att) => {
        const mime = typeof att === 'string' ? null : ((att as any).mimeType as string | null)
        return !!mime && mime.startsWith('application/pdf')
      })
    : []

  return (
    <div className="block md:flex">
      <Sidebar locale={lang} />
      <main className="px-4 py-6 sm:px-6 lg:px-8 flex-1">
        <aside className="mb-4 max-w-5xl">
          <MaterialNavigation
            currentMaterial={material}
            materials={allMaterials}
            locale={lang}
            filters={filters}
          />
        </aside>

        <article className="max-w-5xl">
          <header className="mb-6 pt-4">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {cefr && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {dict.cefrLabel} {cefr}
                </span>
              )}
              {material.schoolType && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {getLocalized(material.schoolType as any, lang)}
                </span>
              )}
            </div>
          </header>

          {/* Actions */}
          {hasExternalOnly ? (
            <section className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                {externalLinks.map((lnk) => {
                  const label =
                    (lang === 'de' ? lnk.label_de : lnk.label_nl) || lnk.label_nl || lnk.label_de
                  const url = lnk.url || '#'
                  return (
                    <a
                      key={lnk.id || url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2"
                    >
                      {label || dict.detailOpenWebsite}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </a>
                  )
                })}
              </div>
            </section>
          ) : null}

          {hasImageHero && (
            <div className="mb-8 overflow-hidden rounded-lg border bg-gray-50 max-w-sm">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={thumbnail.url!}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Meta */}
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            {Array.isArray(material.materialTypes) && material.materialTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{dict.materialTypesTitle}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {material.materialTypes.map((t) => (
                    <span
                      key={typeof t === 'string' ? t : (t as any).id}
                      className="rounded bg-gray-100 px-2 py-0.5 text-sm"
                    >
                      {getLocalized(t as any, lang)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(material.topics) && material.topics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{dict.topicsTitle}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {material.topics.map((t) => (
                    <span
                      key={typeof t === 'string' ? t : (t as any).id}
                      className="rounded bg-gray-100 px-2 py-0.5 text-sm"
                    >
                      {getLocalized(t as any, lang)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(material.competences) && material.competences.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{dict.competencesTitle}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {material.competences.map((c) => (
                    <span
                      key={typeof c === 'string' ? c : (c as any).id}
                      className="rounded bg-gray-100 px-2 py-0.5 text-sm"
                    >
                      {getLocalized(c as any, lang)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {material.description_nl || material.description_de ? (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  {lang === 'de' ? 'Beschreibung' : 'Beschrijving'}
                </h3>
                <p className="mt-2 whitespace-pre-line text-gray-800">
                  {(lang === 'de' ? material.description_de : material.description_nl) ||
                    material.description_nl ||
                    material.description_de}
                </p>
              </div>
            ) : null}

            {material.contact ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{dict.contactLabel}</h3>
                <div className="mt-2 text-gray-800">
                  {renderTextWithEmailLinks(material.contact)}
                </div>
              </div>
            ) : null}

            {material.license ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{dict.licenseLabel}</h3>
                <p className="mt-2 text-gray-800">{material.license}</p>
              </div>
            ) : null}
          </section>

          {/* Actions */}
          {!hasExternalOnly && (
            <section className="mb-10">
              <div className="flex flex-wrap items-center gap-3">
                {Array.isArray(material.attachments) &&
                  material.attachments.map((att) => {
                    const id = typeof att === 'string' ? att : (att as any).id
                    const mime =
                      typeof att === 'string' ? null : ((att as any).mimeType as string | null)
                    const filename =
                      typeof att === 'string'
                        ? undefined
                        : ((att as any).filename as string | undefined)
                    const isPdf = !!mime && mime.startsWith('application/pdf')
                    return (
                      <a
                        key={id}
                        href={`/api/media/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm hover:bg-gray-50"
                        download
                      >
                        {isPdf ? 'Download PDF' : filename || dict.detailDownload}
                      </a>
                    )
                  })}
              </div>
            </section>
          )}

          {/* Additional links */}
          {externalLinks.length > 0 && !hasExternalOnly && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                {dict.detailExternalLinksTitle}
              </h2>
              <ul className="list-inside list-disc space-y-2">
                {externalLinks.map((lnk) => {
                  const label =
                    (lang === 'de' ? lnk.label_de : lnk.label_nl) ||
                    lnk.label_nl ||
                    lnk.label_de ||
                    lnk.url
                  const url = lnk.url || '#'
                  return (
                    <li key={lnk.id || lnk.url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* PDF embeds */}
          {pdfLinks.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">PDF</h2>
              {pdfLinks.map((lnk) => (
                <PDFEmbed key={lnk.id || lnk.url} url={lnk.url || ''} />
              ))}
            </section>
          )}

          {/* PDF attachment embeds */}
          {pdfAttachments.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                {pdfLinks.length > 0 ? 'Additional PDFs' : 'PDF'}
              </h2>
              {pdfAttachments.map((att) => {
                if (!att || typeof att !== 'object' || !att.url) return null
                return (
                  <div key={att.id} className="mb-6">
                    <PDFEmbed url={att.url} />
                  </div>
                )
              })}
            </section>
          )}
        </article>
        <Footer />
      </main>
    </div>
  )
}
