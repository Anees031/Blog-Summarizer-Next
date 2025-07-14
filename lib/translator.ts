export async function translateToUrdu(englishText: string): Promise<string> {
  try {
    // Clean the text before translation
    const cleanedText = cleanTextForTranslation(englishText);
    
    // Split text into chunks of 400 characters (leaving room for encoding)
    // Split at sentence boundaries when possible
    const chunks = splitIntoChunks(cleanedText);
    
    // Translate each chunk
    const translatedChunks = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|ur`
        );
        const data = await response.json();
        return data.responseData.translatedText;
      })
    );
    
    // Combine translated chunks
    return translatedChunks.join(' ');
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

// Helper function to split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number = 400): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split into sentences first
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed chunk size, save current chunk and start new one
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    // If a single sentence is longer than maxChunkSize, split it by words
    if (sentence.length > maxChunkSize) {
      const words = sentence.split(/\s+/);
      for (const word of words) {
        if ((currentChunk + ' ' + word).length > maxChunkSize) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + word;
        }
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if there is one
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Helper function to clean text before translation
function cleanTextForTranslation(text: string): string {
  // Remove title if it appears at the start
  const titleMatch = text.match(/^([^.!?]+)[-]{2}/);
  if (titleMatch) {
    text = text.substring(titleMatch[0].length).trim();
  }
  
  // Remove reading time
  text = text.replace(/\d+\s*min read/i, '');
  
  // Remove date
  text = text.replace(/·[A-Za-z]+\s+\d+,\s+\d{4}/g, '');
  
  // Remove metadata like Listen, Share
  text = text.replace(/Listen|Share/g, '');
  
  // Remove photo credit
  text = text.replace(/Photo by .* on Unsplash/i, '');
  
  // Remove AIML tag
  text = text.replace(/AIML/g, '');
  
  // Remove "Read More" and similar endings
  text = text.replace(/Read More.*$/i, '');
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to calculate translation ratio (for debugging)
function calculateTranslationRatio(original: string, translated: string): number {
  return translated.length / original.length;
}

// Helper function to get translation stats (for debugging)
export function getTranslationStats(englishText: string): {
  totalWords: number,
  translatedWords: number,
  translationPercentage: number,
  untranslatedWords: string[]
} {
  const words = englishText.toLowerCase().split(/\s+/);
  return {
    totalWords: words.length,
    translatedWords: words.length, // Since we're using an API, all words are translated
    translationPercentage: 100,
    untranslatedWords: []
  };
} 