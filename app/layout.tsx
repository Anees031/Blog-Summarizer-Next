import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Blog Genius - Smart Content Analysis',
  description: 'Transform lengthy blog posts into concise summaries with AI-powered translation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gradient-to-br from-[#181e29] via-[#232b3a] to-[#181e29] min-h-screen font-sans antialiased">
        <div className="min-h-screen">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 