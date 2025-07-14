// Clean text before processing
function cleanTextForSummary(text: string): string {
  // Remove title and separator if they appear at the start
  const titleMatch = text.match(/^([^.!?]+)[-]{2}/);
  if (titleMatch) {
    text = text.substring(titleMatch[0].length).trim();
  }

  // Remove reading time
  text = text.replace(/\d+\s*min read/i, '');
  
  // Remove date patterns
  text = text.replace(/·[A-Za-z]+\s+\d+,\s+\d{4}/g, '');
  text = text.replace(/[A-Za-z]+\s+\d+,\s+\d{4}/g, '');
  
  // Remove common metadata
  text = text.replace(/Listen|Share|AIML/g, '');
  text = text.replace(/Photo by .* on Unsplash/i, '');
  
  // Remove "Read More" sections
  text = text.replace(/Read More.*$/i, '');
  
  // Remove any remaining title-like prefixes
  text = text.replace(/^[^:]+:/, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Static AI Summary Logic - Simulates AI summarization
export function generateSummary(content: string, title: string): string {
  // Clean the content before processing
  content = cleanTextForSummary(content);

  // Lower the minimum content length requirement
  if (!content || content.length < 30) {
    throw new Error('Content is too short to summarize')
  }

  // Split content into sentences
  const sentences = content
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 10) // Reduced minimum sentence length

  if (sentences.length === 0) {
    return 'Unable to generate summary from provided content.'
  }

  // Simple scoring algorithm for sentence importance
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0
    
    // First and last sentences get higher scores
    if (index === 0 || index === sentences.length - 1) {
      score += 2
    }
    
    // Middle sentences get moderate score
    if (index > 0 && index < sentences.length - 1) {
      score += 1
    }

    // Sentences with numbers, dates, or statistics
    if (/\d+/.test(sentence)) {
      score += 1.5
    }

    // Sentences with keywords indicating importance
    const importantWords = [
      'important', 'significant', 'key', 'main', 'primary', 'essential',
      'crucial', 'vital', 'critical', 'major', 'principal', 'fundamental',
      'conclude', 'conclusion', 'result', 'findings', 'discovery',
      'research', 'study', 'analysis', 'therefore', 'consequently',
      'demand', 'require', 'announce', 'state', 'claim', 'argue',
      'emphasize', 'highlight', 'stress', 'focus', 'point out',
      'investment', 'development', 'growth', 'decline', 'increase', 'decrease',
      'launch', 'introduce', 'release', 'unveil', 'reveal', 'disclose'
    ]
    
    const lowerSentence = sentence.toLowerCase()
    importantWords.forEach(word => {
      if (lowerSentence.includes(word)) {
        score += 1.5
      }
    })

    // Sentences with action verbs get higher scores
    const actionVerbs = [
      'demand', 'require', 'develop', 'invest', 'grow', 'launch',
      'announce', 'reveal', 'introduce', 'create', 'build', 'establish',
      'implement', 'improve', 'enhance', 'expand', 'reduce', 'increase'
    ]
    
    actionVerbs.forEach(verb => {
      if (lowerSentence.includes(verb)) {
        score += 1
      }
    })

    // Sentences with company/organization names
    const organizations = [
      'openai', 'microsoft', 'google', 'apple', 'nvidia', 'meta',
      'amazon', 'tesla', 'ibm', 'oracle', 'salesforce'
    ]
    
    organizations.forEach(org => {
      if (lowerSentence.toLowerCase().includes(org.toLowerCase())) {
        score += 1
      }
    })

    // Longer sentences (but not too long) get slight preference
    const wordCount = sentence.split(/\s+/).length
    if (wordCount >= 8 && wordCount <= 30) {
      score += 0.5
    }

    return { sentence, score, index }
  })

  // Sort by score and select top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, Math.max(2, Math.ceil(sentences.length * 0.6)))) // Take more sentences, minimum 2
    .sort((a, b) => a.index - b.index) // Restore original order

  // Create summary
  let summary = topSentences.map(item => item.sentence).join('. ')
  
  // Ensure summary ends with proper punctuation
  if (!summary.match(/[.!?]$/)) {
    summary += '.'
  }

  return summary
}

// Extract key topics from content for better summarization
export function extractKeyTopics(content: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4)

  // Count word frequency
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  // Filter out common words
  const commonWords = new Set([
    'about', 'after', 'again', 'against', 'before', 'being', 'below',
    'between', 'during', 'further', 'having', 'other', 'should',
    'through', 'under', 'until', 'where', 'while', 'would', 'could',
    'their', 'there', 'these', 'those', 'which', 'article', 'content'
  ])

  // Get top keywords
  const keywords = Object.entries(wordCount)
    .filter(([word]) => !commonWords.has(word))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)

  return keywords
} 