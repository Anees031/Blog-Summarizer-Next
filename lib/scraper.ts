import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedBlog {
  title: string
  content: string
  author?: string
  publishedDate?: string
  wordCount: number
}

// Clean text before processing
function cleanScrapedContent(text: string, title: string): string {
  // Remove the title from the beginning of content
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  text = text.replace(new RegExp(`^${escapedTitle}`), '');
  text = text.replace(new RegExp(`^[^a-zA-Z]*${escapedTitle}`), '');
  
  // Remove reading time
  text = text.replace(/\d+\s*min read/i, '');
  
  // Remove date patterns
  text = text.replace(/·[A-Za-z]+\s+\d+,\s+\d{4}/g, '');
  text = text.replace(/[A-Za-z]+\s+\d+,\s+\d{4}/g, '');
  
  // Remove common metadata
  text = text.replace(/Listen|Share|AIML/g, '');
  text = text.replace(/Photo by .* on Unsplash/i, '');
  
  // Remove special characters from start
  text = text.replace(/^[^a-zA-Z]+/, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

export async function scrapeBlogContent(url: string): Promise<ScrapedBlog> {
  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol')
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    })

    const $ = cheerio.load(response.data)

    // Extract title - try multiple selectors
    let title = $('title').text().trim()
    if (!title) {
      title = $('h1').first().text().trim()
    }
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || ''
    }

    // Extract main content - try multiple selectors for common blog structures
    let content = ''
    
    // Common content selectors
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.content',
      '.post-body',
      'main',
      '.article-body',
      '[role="main"]'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length > 0 && element.text().trim().length > content.length) {
        content = element.text().trim()
      }
    }

    // If no content found with selectors, try to extract from paragraphs
    if (!content || content.length < 100) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join(' ')
    }

    // Extract author
    let author = ''
    const authorSelectors = [
      '.author',
      '.byline',
      '[rel="author"]',
      '.post-author',
      'meta[name="author"]'
    ]

    for (const selector of authorSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        author = element.attr('content') || element.text().trim()
        break
      }
    }

    // Extract published date
    let publishedDate = ''
    const dateSelectors = [
      'time[datetime]',
      '.published',
      '.post-date',
      'meta[property="article:published_time"]'
    ]

    for (const selector of dateSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        publishedDate = element.attr('datetime') || element.attr('content') || element.text().trim()
        break
      }
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()

    // Clean the content using the title
    content = cleanScrapedContent(content, title)

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length

    if (!title || !content || content.length < 50) {
      throw new Error('Could not extract sufficient content from the webpage')
    }

    return {
      title: title.substring(0, 200), // Limit title length
      content,
      author: author.substring(0, 100), // Limit author length
      publishedDate,
      wordCount
    }

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape blog content: ${error.message}`)
    }
    throw new Error('Failed to scrape blog content: Unknown error')
  }
} 