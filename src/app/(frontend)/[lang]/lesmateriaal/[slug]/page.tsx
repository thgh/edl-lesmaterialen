import { getDictionary } from '@/i18n/dictionaries'
import { CourseMaterial } from '@/payload-types'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Sidebar } from '../../../components/Sidebar'
import '../../../styles.css'

// PDF Embed Component
function PDFEmbed({ url }: { url: string }) {
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`

  return (
    <div className="mt-3 mb-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <iframe src={proxyUrl} className="w-full h-screen" title="PDF Document" frameBorder="0" />
      </div>
    </div>
  )
}

type Params = { lang: 'nl' | 'de'; slug: string }

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

function getLocalized<T extends { title_nl?: string | null; title_de?: string | null }>(
  obj: T | string | null | undefined,
  locale: 'nl' | 'de',
) {
  if (!obj || typeof obj === 'string') return ''
  return (locale === 'de' ? obj.title_de : obj.title_nl) || obj.title_nl || obj.title_de || ''
}

export default async function CourseMaterialPage({ params }: { params: Promise<Params> }) {
  const p = await params
  const locale = p.lang === 'de' ? 'de' : 'nl'
  const dict = getDictionary(locale)
  const material = await fetchMaterialBySlugOrId(p.slug)

  if (!material) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-gray-600">Not found</p>
        <Link href={`/${locale}`} className="mt-4 inline-block text-blue-600 hover:underline">
          {dict.detailBackToOverview}
        </Link>
      </main>
    )
  }

  const title =
    (locale === 'de' ? material.title_de : material.title_nl) ||
    material.title_de ||
    material.title_nl ||
    material.title ||
    'Untitled'

  const firstAttachment =
    Array.isArray(material.attachments) && material.attachments.length > 0
      ? material.attachments[0]
      : null

  const firstAttachmentId = firstAttachment
    ? typeof firstAttachment === 'string'
      ? firstAttachment
      : (firstAttachment as any).id
    : null

  const firstAttachmentMime =
    firstAttachment && typeof firstAttachment !== 'string'
      ? (firstAttachment as any).mimeType || null
      : null

  const hasImageHero = !!(
    firstAttachmentId &&
    firstAttachmentMime &&
    firstAttachmentMime.startsWith('image/')
  )

  const externalLinks = material.links || []
  const hasExternalOnly =
    externalLinks.length > 0 && (!material.attachments || material.attachments.length === 0)

  const cefr = material.cefr?.join(', ')

  const pdfLinks = externalLinks.filter((lnk) => lnk.url?.toLowerCase().endsWith('.pdf'))

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr]">
      <Sidebar locale={locale} />
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href={`/${locale}`} className="text-sm text-blue-600 hover:underline">
            {dict.detailBackToOverview}
          </Link>
        </div>

        <article className="mx-auto max-w-5xl">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {cefr && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {dict.cefrLabel} {cefr}
                </span>
              )}
              {material.schoolType && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {getLocalized(material.schoolType as any, locale)}
                </span>
              )}
            </div>
          </header>

          {hasImageHero && (
            <div className="mb-8 overflow-hidden rounded-lg border bg-gray-50">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={`/api/media/${firstAttachmentId}`}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <section className="mb-10">
            {hasExternalOnly ? (
              <div className="flex flex-wrap items-center gap-3">
                {externalLinks.map((lnk) => {
                  const label =
                    (locale === 'de' ? lnk.label_de : lnk.label_nl) || lnk.label_nl || lnk.label_de
                  const url = lnk.url || '#'
                  return (
                    <a
                      key={lnk.id || url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
            ) : (
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
                        {isPdf ? 'PDF' : filename || dict.detailDownload}
                      </a>
                    )
                  })}
              </div>
            )}
          </section>

          {/* Additional links */}
          {externalLinks.length > 0 && !hasExternalOnly && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                {dict.detailExternalLinksTitle}
              </h2>
              <ul className="list-inside list-disc space-y-2">
                {externalLinks.map((lnk) => {
                  const label =
                    (locale === 'de' ? lnk.label_de : lnk.label_nl) ||
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
                      {getLocalized(t as any, locale)}
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
                      {getLocalized(t as any, locale)}
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
                      {getLocalized(c as any, locale)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {material.description_nl || material.description_de ? (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  {locale === 'de' ? 'Beschreibung' : 'Beschrijving'}
                </h3>
                <p className="mt-2 whitespace-pre-line text-gray-800">
                  {(locale === 'de' ? material.description_de : material.description_nl) ||
                    material.description_nl ||
                    material.description_de}
                </p>
              </div>
            ) : null}
          </section>

          {/* PDF embeds */}
          {pdfLinks.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">PDF</h2>
              {pdfLinks.map((lnk) => (
                <PDFEmbed url={lnk.url || ''} />
              ))}
            </section>
          )}
        </article>
      </main>
    </div>
  )
}
