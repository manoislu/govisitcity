import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('💾 API save-travel-plan called!')
    
    const { title, city, startDate, endDate, participants, budget, activities, itinerary } = await request.json()
    console.log('💾 Request data:', { title, city, startDate, endDate, participants, budget, activities: activities?.length, itinerary: itinerary?.length })

    if (!title || !city || !startDate || !endDate || !itinerary) {
      console.log('❌ Missing required data')
      return NextResponse.json(
        { error: 'Missing required data: title, city, startDate, endDate, itinerary' },
        { status: 400 }
      )
    }

    // If Supabase is not available, just return success without saving
    if (!supabase) {
      console.log('⚠️ Supabase not available, simulating save only')
      return NextResponse.json({ 
        success: true, 
        message: 'Plan simulé comme sauvegardé (mode démo)',
        id: `demo_${Date.now()}`
      })
    }

    console.log('💾 Saving to Supabase...')
    
    // Extraire uniquement les IDs des activités pour éviter les doublons
    const activityIds = activities.map((activity: any) => activity.id)
    const itineraryWithIds = itinerary.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => activity.id)
    }))
    
    const travelPlanData = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      city: city,
      start_date: startDate,
      end_date: endDate,
      participants: participants,
      budget: budget,
      activity_ids: activityIds, // Stocker uniquement les IDs
      itinerary: itineraryWithIds, // Stocker les IDs dans l'itinéraire
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('travel_plans')
      .insert(travelPlanData)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save travel plan', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Travel plan saved successfully:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Travel plan saved successfully',
      data: data
    })

  } catch (error) {
    console.error('💥 ERROR in save-travel-plan API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}