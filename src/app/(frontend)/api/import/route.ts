import configPromise from '@payload-config'
import { getPayload } from 'payload'
import * as XLSX from 'xlsx'

// Language mapping from Dutch to the select options
const languageMapping: Record<string, string> = {
  Nederlands: 'nl',
  Duits: 'de',
  Engels: 'en',
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
      return existingDoc.id
    }

    // Create new taxonomy item with both languages
    const created = await payload.create({
      collection,
      data: {
        title_nl: dutchTitle,
        title_de: germanTitle,
      },
    })

    return created.id
  } else {
    // Single language (Dutch) - original logic
    const existing = await payload.find({
      collection,
      where: {
        title_nl: { equals: title.trim() },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0].id
    }

    // Create new taxonomy item
    const created = await payload.create({
      collection,
      data: {
        title_nl: title.trim(),
      },
    })

    return created.id
  }
}

// import xlsx file
export const POST = async (request: Request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const deleteAll = formData.get('deleteAll') === 'true'
    const status = (formData.get('status') as 'draft' | 'published') || 'draft'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const payload = await getPayload({
      config: configPromise,
    })

    // Delete all existing course materials if requested
    if (deleteAll) {
      const ok = await payload.delete({
        collection: 'course-materials',
        where: {},
      })
      console.log('deleted materials', ok.docs.length)
    }

    // Read the file buffer
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    // Remove header row
    const dataRows = rows.slice(1)

    const results = []
    let successCount = 0
    let errorCount = 0

    // Loop over each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]

      try {
        // Skip empty rows
        if (!row[0] || row[0].toString().trim() === '') continue

        const naam = row[0]?.toString() || ''
        const link = row[1]?.toString() || ''
        const schooltype = row[2]?.toString() || ''
        const competentie = row[3]?.toString() || ''
        const onderwerp = row[4]?.toString() || ''
        const materiaalsoort = row[5]?.toString() || ''
        const taal = row[6]?.toString() || ''
        const erkNiveau = row[7]?.toString() || ''

        // Process school types (split by comma if multiple)
        const schoolTypes = schooltype
          ? schooltype
              .split(',')
              .map((st: string) => st.trim())
              .filter((st: string) => st)
          : []
        const schoolTypeIds = []
        for (const st of schoolTypes) {
          const id = await findOrCreateTaxonomy(payload, 'school-types', st)
          if (id) schoolTypeIds.push(id)
        }

        // Process competences (split by comma if multiple)
        const competences = competentie
          ? competentie
              .split(',')
              .map((c: string) => c.trim())
              .filter((c: string) => c)
          : []
        const competenceIds = []
        for (const comp of competences) {
          const id = await findOrCreateTaxonomy(payload, 'competences', comp)
          if (id) competenceIds.push(id)
        }

        // Process topics (split by comma if multiple)
        const topics = onderwerp
          ? onderwerp
              .split(',')
              .map((t: string) => t.trim())
              .filter((t: string) => t)
          : []
        const topicIds = []
        for (const topic of topics) {
          const id = await findOrCreateTaxonomy(payload, 'topics', topic)
          if (id) topicIds.push(id)
        }

        // Process material types (split by comma if multiple)
        const materialTypes = materiaalsoort
          ? materiaalsoort
              .split(',')
              .map((m: string) => m.trim())
              .filter((m: string) => m)
          : []
        const materialTypeIds = []
        for (const materialType of materialTypes) {
          const id = await findOrCreateTaxonomy(payload, 'material-types', materialType)
          if (id) materialTypeIds.push(id)
        }

        // Process languages (split by comma if multiple)
        const languages = taal
          ? taal
              .split(',')
              .map((l: string) => l.trim())
              .filter((l: string) => l)
          : []
        const languageValues = languages
          .map((lang: string) => languageMapping[lang])
          .filter((lang: string) => lang)

        // Process CEFR levels (split by comma if multiple)
        const cefrLevels = erkNiveau
          ? erkNiveau
              .split(',')
              .map((level: string) => level.trim())
              .filter((level: string) => level)
          : []

        // Create course material
        const courseMaterialData: any = {
          status: status,
          language: languageValues,
          cefr: cefrLevels,
        }

        // Determine which title field to use based on language
        // If the material has only German language, use title_de
        // Otherwise, use title_nl (default)
        if (languageValues.length === 1 && languageValues[0] === 'de') {
          courseMaterialData.title_de = naam
        } else {
          courseMaterialData.title_nl = naam
        }

        // Add links if provided
        if (link) {
          courseMaterialData.link = link
          courseMaterialData.links = [
            {
              url: link,
            },
          ]
        }

        // Add relationships if they exist
        if (schoolTypeIds.length > 0) {
          courseMaterialData.schoolType = schoolTypeIds
        }

        if (competenceIds.length > 0) {
          courseMaterialData.competences = competenceIds
        }

        if (topicIds.length > 0) {
          courseMaterialData.topics = topicIds
        }

        if (materialTypeIds.length > 0) {
          courseMaterialData.materialTypes = materialTypeIds
        }

        // Check for duplicate: same title + same link
        const titleField =
          languageValues.length === 1 && languageValues[0] === 'de' ? 'title_de' : 'title_nl'
        const titleValue = naam

        // Find existing course materials with same title
        const existingMaterials = await payload.find({
          collection: 'course-materials',
          where: {
            and: [{ [titleField]: { equals: titleValue } }, { link: { equals: link } }],
          },
          limit: 100, // Get multiple in case there are duplicates
        })

        // Check if any existing material has the same link
        const duplicate = existingMaterials.docs.find((doc: any) => {
          if (link) {
            // If link is provided, check if any link in the array matches
            return (
              doc.links && Array.isArray(doc.links) && doc.links.some((l: any) => l.url === link)
            )
          } else {
            // If no link, check if material also has no links
            return !doc.links || !Array.isArray(doc.links) || doc.links.length === 0
          }
        })

        if (duplicate) {
          // Duplicate found - skip creation
          results.push({
            row: i + 2,
            success: true,
            id: duplicate.id,
            title: naam,
            duplicate: true,
          })
          successCount++
          continue
        }

        const created = await payload.create({
          collection: 'course-materials',
          data: courseMaterialData,
        })

        results.push({
          row: i + 2, // +2 because we removed header and arrays are 0-indexed
          success: true,
          id: created.id,
          title: naam,
        })
        successCount++
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error)
        results.push({
          row: i + 2,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          title: row[0]?.toString() || 'Unknown',
        })
        errorCount++
      }
    }

    return Response.json({
      message: 'Import completed',
      summary: {
        total: dataRows.length,
        success: successCount,
        errors: errorCount,
      },
      results,
    })
  } catch (error) {
    console.error('Import error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
