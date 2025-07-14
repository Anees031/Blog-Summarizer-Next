# Blog Summarizer

A powerful web application that scrapes blog content, generates AI summaries, translates to Urdu, and stores data in dual databases (Supabase and MongoDB).

## Features

- 🌐 **Web Scraping**: Extract content from any blog URL using advanced scraping techniques
- 🤖 **AI Summarization**: Generate intelligent summaries using static AI logic simulation
- 🌍 **Urdu Translation**: Translate summaries to Urdu using a comprehensive JavaScript dictionary
- 💾 **Dual Storage**: Save summaries in Supabase and full content in MongoDB
- 🎨 **Modern UI**: Beautiful, responsive interface built with ShadCN UI components
- ⚡ **Real-time Progress**: Track processing steps with live status updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI, Radix UI, Lucide React Icons
- **Backend**: Next.js API Routes
- **Databases**: Supabase (PostgreSQL), MongoDB
- **Scraping**: Cheerio, Axios
- **Deployment**: Vercel (recommended)

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **Supabase account** and project
4. **MongoDB Atlas account** (or local MongoDB instance)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog_summarizer?retryWrites=true&w=majority

# Next.js Configuration (for production)
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://your-deployed-url.vercel.app
```

## Database Setup

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor and run the following schema:

```sql
-- Create blog_summaries table
CREATE TABLE IF NOT EXISTS blog_summaries (
  id BIGSERIAL PRIMARY KEY,
  blog_url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary_english TEXT NOT NULL,
  summary_urdu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_summaries_url ON blog_summaries(blog_url);
CREATE INDEX IF NOT EXISTS idx_blog_summaries_created_at ON blog_summaries(created_at);

-- Enable Row Level Security (optional)
ALTER TABLE blog_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (adjust as needed)
CREATE POLICY "Allow anonymous read access" ON blog_summaries
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON blog_summaries
FOR INSERT WITH CHECK (true);
```

3. Copy your project URL and anon key from Settings > API

### MongoDB Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database named `blog_summarizer`
3. The application will automatically create the `blog_contents` collection
4. Copy your connection string and add it to your environment variables

## Installation

1. **Clone the repository** (or use the code from assignment-2/ directory)

```bash
git clone <repository-url>
cd assignment-2
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your database credentials.

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a Blog URL**: Paste any blog URL into the input field
2. **Click Summarize**: The application will process your request through four steps:
   - Scraping blog content
   - Generating AI summary
   - Translating to Urdu
   - Saving to databases
3. **View Results**: See the original content info, English summary, Urdu translation, and database storage confirmation

## API Endpoints

### POST /api/summarize

Processes a blog URL and returns summary data.

**Request Body:**
```json
{
  "url": "https://example.com/blog-post"
}
```

**Response:**
```json
{
  "id": 1,
  "blog_url": "https://example.com/blog-post",
  "title": "Blog Post Title",
  "summary_english": "Generated summary...",
  "summary_urdu": "اردو ترجمہ...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "word_count": 1500,
  "author": "Author Name"
}
```

### GET /api/summarize

Returns API information and usage instructions.

## Deployment on Vercel

1. **Install Vercel CLI** (optional)

```bash
npm i -g vercel
```

2. **Deploy using Vercel Dashboard**

   - Connect your GitHub repository to Vercel
   - Add environment variables in the Vercel dashboard
   - Deploy automatically on push

3. **Or deploy using CLI**

```bash
vercel --prod
```

4. **Set up environment variables in Vercel**

   Go to your project settings in Vercel and add all the environment variables from your `.env.local` file.

## Environment Variables for Vercel

Make sure to add these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Features Deep Dive

### Web Scraping
- Supports multiple blog platforms and content structures
- Robust content extraction with fallback selectors
- Extracts title, content, author, and publication date
- Handles various HTML structures and edge cases

### AI Summarization
- Uses sentence scoring algorithm based on position, keywords, and content
- Identifies important sentences using keyword analysis
- Maintains original context and meaning
- Configurable summary length and quality

### Urdu Translation
- Comprehensive English-to-Urdu dictionary with 1000+ words
- Handles common sentence structures and grammar patterns
- Supports technical and blog-related terminology
- Graceful handling of untranslated words

### Database Strategy
- **Supabase**: Stores summaries, metadata, and searchable content
- **MongoDB**: Archives full content for backup and analysis
- Cross-referencing between databases for data integrity
- Optimized for both read and write operations

## Troubleshooting

### Common Issues

1. **Scraping Fails**
   - Check if the URL is accessible
   - Some sites block automated requests
   - Try different blog URLs

2. **Database Connection Issues**
   - Verify environment variables
   - Check database credentials
   - Ensure IP whitelist includes your deployment

3. **Translation Not Working**
   - Check if content contains supported words
   - Review translation dictionary coverage
   - Some technical terms may not be translated

### Performance Optimization

- Enable database connection pooling
- Implement caching for frequently scraped URLs
- Use CDN for static assets
- Monitor API response times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using Next.js, ShadCN UI, Supabase, and MongoDB** 