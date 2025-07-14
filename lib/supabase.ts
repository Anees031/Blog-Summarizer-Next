import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for summary table
export interface BlogSummary {
  id?: number
  blog_url: string
  title: string
  summary_english: string
  summary_urdu: string
  created_at?: string
  updated_at?: string
} 