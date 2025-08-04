import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Predefined taxonomies data
const taxonomies = {
  'school-types': [
    'Basisschool / Grundschule',
    'Voortgezet onderwijs / Weiterführende Schule',
    'MBO / Berufsschule',
  ],
  competences: [
    'Spreken / Sprechen',
    'Luisteren (en/of kijken) / Hören (und Sehen)',
    'Schrijven / Schreiben',
    'Lezen / Lesen',
    'Euregionale (interculturele) competenties / Euregionale (interkulturelle) Kompetenz',
    'Woordenschat / Wortschatz',
    'Medien- & tekstcompetentie / Medien- & Textkompetenz',
    'Uitspraak / Aussprache',
  ],
  topics: [
    'Schoolsystemen / Schulsysteme',
    'Arbeidswereld & Studie / Arbeitswelt & Studium',
    'Mode / Mode',
    'Reclame / Werbung',
    'Wonen / Wohnen',
    "Hobby's / Hobbys",
    'Relaties (vrienden & familie) / Beziehungen (Freunde & Familie)',
    'Communicatie & Informatie / Öffentliche Kommunikation & Information',
    'Jeugdcultuur / Jugendkultur',
    'Duurzaamheid (klimaat) / Nachhaltigkeit (Klima)',
    'Natuur / Natur',
    'Politiek / Politik',
    'Democratie / Demokratie',
    'Burgerschap / (geen vertaling)',
    'Maatschappij / Gesellschaft',
    'Economie / Wirtschaft',
    'Kunst / Kunst',
    'Muziek / Musik',
    'Dagelijks leven / Alltag',
    'Feestdagen & tradities / Feiertage & Traditionen',
    'Diversiteit / Diversität',
    'Identiteit / Identität',
    'Sport / Sport',
    'Euregio / Euregio',
    'Geschiedenis / Geschichte',
    'Reizen / Reisen',
    'Duitsland / Deutschland',
    'Nederland / Niederlande',
    'België / Belgien',
    'Media /  Medien',
    'Taal / Sprache',
    'interculturele communicatie / Interkulturelle Kommunikation',
    'Film',
    'Eten / Essen',
  ],
  'material-types': [
    'Video / Video',
    'Podcast / Podcast',
    'Digitale leeromgeving / Digitale Lernumgebung',
    'Online werkvorm / Online Tool',
    'Groepsactiviteit / Gruppenaktivität',
    'Leesboek / Lesebuch',
    'Werkboek / Arbeitsheft',
    'Werkblad / Arbeitsblatt',
    'Leskist (analoog) / Unterrichtskiste (analog)',
    'Spelletje / Spiel',
    'Liedje / Lied',
    'Leestekst / Lesetext',
    'Lesplan / Unterrichtsplan',
    'Tekst / Text',
  ],
}

// Helper function to find or create taxonomy item with bilingual support
async function findOrCreateTaxonomy(payload: any, collection: string, title: string) {
  if (!title || title.trim() === '') return null

  // Check if title contains a slash (bilingual)
  const hasSlash = title.includes(' / ')

  if (hasSlash) {
    // Split on slash and trim both parts
    const [dutchTitle, germanTitle] = title.split(' / ').map((part) => part.trim())

    // Try to find existing taxonomy item by Dutch title
    const existing = await payload.find({
      collection,
      where: {
        title_nl: { equals: dutchTitle },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // Update existing item with German title if it doesn't have one
      const existingDoc = existing.docs[0]
      if (!existingDoc.title_de) {
        await payload.update({
          collection,
          id: existingDoc.id,
          data: {
            title_de: germanTitle,
          },
        })
      }
      return { id: existingDoc.id, created: false, updated: !existingDoc.title_de }
    }

    // Create new taxonomy item with both languages
    const created = await payload.create({
      collection,
      data: {
        title_nl: dutchTitle,
        title_de: germanTitle,
        slug: dutchTitle
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      },
    })

    return { id: created.id, created: true, updated: false }
  } else {
    // Single language - original logic
    const existing = await payload.find({
      collection,
      where: {
        title_nl: { equals: title.trim() },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return { id: existing.docs[0].id, created: false, updated: false }
    }

    // Create new taxonomy item
    const created = await payload.create({
      collection,
      data: {
        title_nl: title.trim(),
        slug: title
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      },
    })

    return { id: created.id, created: true, updated: false }
  }
}

export const POST = async (request: Request) => {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const results: any = {}
    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0

    // Process each taxonomy collection
    for (const [collection, items] of Object.entries(taxonomies)) {
      results[collection] = []

      for (const item of items) {
        try {
          const result = await findOrCreateTaxonomy(payload, collection, item)

          if (result) {
            if (result.created) {
              totalCreated++
              results[collection].push({
                title: item,
                status: 'created',
                id: result.id,
              })
            } else if (result.updated) {
              totalUpdated++
              results[collection].push({
                title: item,
                status: 'updated',
                id: result.id,
              })
            } else {
              totalSkipped++
              results[collection].push({
                title: item,
                status: 'skipped',
                id: result.id,
              })
            }
          }
        } catch (error) {
          console.error(`Error processing ${item} in ${collection}:`, error)
          results[collection].push({
            title: item,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    return Response.json({
      message: 'Taxonomies added successfully',
      summary: {
        totalCreated,
        totalUpdated,
        totalSkipped,
        totalProcessed: totalCreated + totalUpdated + totalSkipped,
      },
      results,
    })
  } catch (error) {
    console.error('Add taxonomies error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
