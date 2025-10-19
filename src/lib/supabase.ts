import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Supabase client initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error)
    supabase = null
  }
} else {
  console.warn('⚠️ Supabase environment variables not found. Using mock data mode.')
}

export { supabase }

// Types pour la base de données
export interface Activity {
  id: string
  name: string
  description: string
  category: string
  duration: string
  rating?: number
  price?: string
  image?: string
  theme?: string
  isPopular?: boolean
  city: string
  isActive: boolean
  created_at: string
  updated_at: string
}

export interface TravelPlan {
  id: string
  title: string
  city: string
  start_date: string
  end_date: string
  participants: number
  budget?: string
  activities: any // JSON
  itinerary: any // JSON
  created_at: string
  updated_at: string
  user_id?: string
}