import { NextRequest, NextResponse } from 'next/server'
import { scrapeBlogContent } from '@/lib/scraper'
import { generateSummary } from '@/lib/summarizer'
import { translateToUrdu } from '@/lib/translator'
import { supabase } from '@/lib/supabase'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Step 1: Scrape blog content
    console.log('Scraping content from:', url)
    let scrapedContent
    try {
      scrapedContent = await scrapeBlogContent(url)
    } catch (error) {
      console.error('Scraping error:', error)
      return NextResponse.json(
        { error: `Failed to scrape content: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      )
    }

    // Step 2: Generate AI summary
    console.log('Generating summary...')
    let englishSummary
    try {
      englishSummary = generateSummary(scrapedContent.content, scrapedContent.title)
    } catch (error) {
      console.error('Summary generation error:', error)
      return NextResponse.json(
        { error: `Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Step 3: Translate to Urdu
    console.log('Translating to Urdu...')
    let urduSummary
    try {
      urduSummary = await translateToUrdu(englishSummary)
    } catch (error) {
      console.error('Translation error:', error)
      return NextResponse.json(
        { error: `Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Step 4: Save to databases (in background)
    const saveToDatabase = async () => {
      try {
        // Save to Supabase
        const summaryData = {
          blog_url: url,
          title: scrapedContent.title,
          summary_english: englishSummary,
          summary_urdu: urduSummary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: supabaseData, error: supabaseError } = await supabase
          .from('blog_summaries')
          .insert(summaryData)
          .select()
          .single()

        if (supabaseError) {
          console.error('Supabase save error:', supabaseError)
          return
        }

        // Save to MongoDB
        try {
          const client = await clientPromise
          const db = client.db('blog_summarizer')
          const collection = db.collection('blog_contents')

          const contentData = {
            blog_url: url,
            title: scrapedContent.title,
            content: scrapedContent.content,
            scraped_at: new Date(),
            word_count: scrapedContent.wordCount,
            author: scrapedContent.author,
            published_date: scrapedContent.publishedDate,
            summary_id: supabaseData?.id
          }

          await collection.insertOne(contentData)
        } catch (mongoError) {
          console.error('MongoDB save error:', mongoError)
        }
      } catch (error) {
        console.error('Database save error:', error)
      }
    }

    // Start database save in background
    saveToDatabase().catch(console.error)

    // Return response immediately without waiting for database operations
    return NextResponse.json({
      blog_url: url,
      title: scrapedContent.title,
      summary_english: englishSummary,
      summary_urdu: urduSummary,
      word_count: scrapedContent.wordCount,
      author: scrapedContent.author
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Blog Summarizer API',
    usage: 'POST to this endpoint with { "url": "https://example.com/blog" }',
    features: [
      'Web scraping',
      'AI summarization',
      'Urdu translation'
    ]
  })
} 