👨‍💻 **Anees Ur Rehman**  
Full Stack Developer  

# Blog Genius Summarizer 

Supercharge your reading! Instantly get smart, AI-powered blog summaries and Urdu translations. Paste a link and let the magic happen!

---

## ✨ Features
- 🌐 **Web Scraping**: Extracts content from any blog URL using advanced scraping techniques.
- 🤖 **AI Summarization**: Generates intelligent summaries using a static AI logic simulation.
- 🌍 **Urdu Translation**: Translates summaries to Urdu using a comprehensive JavaScript dictionary.
- 💾 **Dual Storage**: Saves summaries in Supabase and full content in MongoDB.
- 🎨 **Modern UI**: Beautiful, responsive interface built with ShadCN UI components.
- ⚡ **Real-time Progress**: Track processing steps with live status updates.
- 📊 **Dashboard**: View all your summarized blogs in one place.

---

## 🛠 Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI, Radix UI, Lucide React Icons
- **Backend**: Next.js API Routes
- **Databases**: Supabase (PostgreSQL), MongoDB Atlas
- **Scraping**: Cheerio, Axios
- **PDF Export**: jsPDF, html2canvas

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **Supabase** account & project
- **MongoDB Atlas** account & cluster

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd blog
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
MONGODB_URI=your-mongodb-uri
```

### 4. Set up Supabase
- Create a table with this SQL:
```sql
CREATE TABLE IF NOT EXISTS blog_summaries (
  id BIGSERIAL PRIMARY KEY,
  blog_url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary_english TEXT NOT NULL,
  summary_urdu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_summaries_url ON blog_summaries(blog_url);
CREATE INDEX IF NOT EXISTS idx_blog_summaries_created_at ON blog_summaries(created_at);
ALTER TABLE blog_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON blog_summaries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON blog_summaries FOR INSERT WITH CHECK (true);
```

### 5. Set up MongoDB Atlas
- Create a cluster and whitelist your IP.
- No need to manually create the `blog_summarizer` database or `blog_contents` collection—they will be created automatically on first insert.

### 6. Run the development server
```bash
npm run dev
# or
yarn dev
```

---

## 🧑‍💻 Usage
1. **Enter a Blog URL**: Paste any blog URL into the input field.
2. **Click Analyze Blog**: The app will scrape, summarize, translate, and save the data.
3. **View Results**: See the English and Urdu summaries, download PDFs, and analyze stats.
4. **Dashboard**: Click the Dashboard button to view all your summarized blogs.

---

## 🗄 Database Structure

### Supabase: `blog_summaries`
- `id`: Primary key
- `blog_url`: Blog URL
- `title`: Blog title
- `summary_english`: English summary
- `summary_urdu`: Urdu summary
- `created_at`, `updated_at`: Timestamps

### MongoDB: `blog_summarizer.blog_contents`
- `blog_url`, `title`, `content`, `scraped_at`, `word_count`, `author`, `published_date`
- `summary_id`: Reference to Supabase summary
- `summary_english`, `summary_urdu`

---

## 📝 License
MIT

---

## 🙋‍♂️ Support
For issues and questions, open an issue in the repository.

---

## ☁️ Deploying on Vercel

You can easily deploy this app for free using [Vercel](https://vercel.com/):

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Sign up or log in to [Vercel](https://vercel.com/).**
3. **Import your repository** into Vercel.
4. **Set environment variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MONGODB_URI`
5. **Deploy!**

Vercel will build and host your app. After deployment, your app will be live at your Vercel domain.

---
