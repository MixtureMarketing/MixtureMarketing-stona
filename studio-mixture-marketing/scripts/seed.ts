import {createClient} from '@sanity/client'
import {LEGACY_ARTICLES} from '../../services/cms/legacyArticles'
import {MARKETING_CONTENT} from '../../data/content/services/marketing/main'

// Ensure we have a client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'azuef2ua',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  token:
    process.env.SANITY_AUTH_TOKEN || process.env.SANITY_SESSION_TOKEN || process.env.SANITY_TOKEN,
  useCdn: false,
})

const MONTHS: {[key: string]: string} = {
  Stycznia: '01',
  Lutego: '02',
  Marca: '03',
  Kwietnia: '04',
  Maja: '05',
  Czerwca: '06',
  Lipca: '07',
  Sierpnia: '08',
  Września: '09',
  Października: '10',
  Listopada: '11',
  Grudnia: '12',
}

function parsePolishDate(dateStr: string): string {
  // Format: "22 Grudnia 2025"
  const parts = dateStr.split(' ')
  if (parts.length !== 3) return new Date().toISOString()

  const day = parts[0].padStart(2, '0')
  const month = MONTHS[parts[1]] || '01'
  const year = parts[2]

  return `${year}-${month}-${day}T12:00:00.000Z`
}

async function seed() {
  console.log('Starting seed process...')
  console.log(`Project ID: ${client.config().projectId}`)
  console.log(`Dataset: ${client.config().dataset}`)

  if (!client.config().token) {
    console.error('No token found! Run with --with-user-token')
    process.exit(1)
  }

  // 1. Articles
  console.log('\n--- Syncing Articles ---')
  for (const article of LEGACY_ARTICLES) {
    const docId = `article-${article.id}`
    console.log(`Processing: ${article.title}`)

    const doc = {
      _id: docId,
      _type: 'article',
      title: article.title,
      slug: {_type: 'slug', current: article.slug.replace('/baza-wiedzy/', '')},
      publishedAt: parsePolishDate(article.date),
      readTime: article.readTime,
      excerpt: article.description,
      tags: article.tags,
      // We skip category reference and image for now to avoid complexity
    }

    // We use createOrReplace to ensure metadata is up to date with local source of truth
    try {
      await client.createOrReplace(doc)
      console.log(`  -> Saved as ${docId}`)
    } catch (e) {
      console.error(`  -> Error saving ${docId}:`, e.message)
    }
  }

  // 2. Industries
  console.log('\n--- Syncing Industries ---')
  if (MARKETING_CONTENT.industries && MARKETING_CONTENT.industries.items) {
    for (const item of MARKETING_CONTENT.industries.items) {
      const slug = item.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]/g, '')
      const docId = `industry-${slug}`
      console.log(`Processing: ${item.title}`)

      const doc = {
        _id: docId,
        _type: 'industry',
        name: item.title,
        slug: {_type: 'slug', current: slug},
        // Fill required fields with placeholders if creating new
        forWho: `Dla branży ${item.title}`,
      }

      // Using createIfNotExists to respect manual edits in Studio
      try {
        // We need to provide required fields for createIfNotExists?
        // Sanity validation happens on publish, but partial docs are okay.
        // However, createIfNotExists takes the document.
        const res = await client.createIfNotExists(doc)
        if (res._id === docId) {
          console.log(`  -> Created new industry: ${docId}`)
        } else {
          console.log(`  -> Industry already exists: ${docId}`)
        }
      } catch (e) {
        console.error(`  -> Error saving ${docId}:`, e.message)
      }
    }
  }

  console.log('\nSeed completed!')
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
