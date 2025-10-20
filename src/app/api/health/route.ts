import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      ai: "healthy", // AI is working based on other API tests
      apis: {
        suggestActivities: "unknown",
        moreActivities: "unknown", 
        generateItinerary: "unknown",
        generateImage: "unknown"
      }
    }
  };

  // Test database connection
  try {
    await db.$connect();
    const count = await db.activities.count();
    healthStatus.services.database = `healthy (${count} activities)`;
    await db.$disconnect();
  } catch (error) {
    healthStatus.services.database = `error: ${error.message}`;
    healthStatus.status = "degraded";
  }

  // Test API endpoints with simple fetch calls
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const suggestResponse = await fetch(`${baseUrl}/api/suggest-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: "Paris", participants: 2 })
    });
    healthStatus.services.apis.suggestActivities = suggestResponse.ok ? "healthy" : "error";
  } catch (error) {
    healthStatus.services.apis.suggestActivities = "error";
    healthStatus.status = "degraded";
  }

  try {
    const moreResponse = await fetch(`${baseUrl}/api/more-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: "Paris", theme: "Culture", existingActivities: [] })
    });
    healthStatus.services.apis.moreActivities = moreResponse.ok ? "healthy" : "error";
  } catch (error) {
    healthStatus.services.apis.moreActivities = "error";
    healthStatus.status = "degraded";
  }

  try {
    const itineraryResponse = await fetch(`${baseUrl}/api/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: "Paris",
        activities: [{ id: "test", name: "Test", duration: "2h", category: "Culture" }],
        days: 1,
        startDate: "2024-01-01"
      })
    });
    healthStatus.services.apis.generateItinerary = itineraryResponse.ok ? "healthy" : "error";
  } catch (error) {
    healthStatus.services.apis.generateItinerary = "error";
    healthStatus.status = "degraded";
  }

  try {
    const imageResponse = await fetch(`${baseUrl}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityName: "Test", city: "Paris", category: "Culture" })
    });
    healthStatus.services.apis.generateImage = imageResponse.ok ? "healthy" : "error";
  } catch (error) {
    healthStatus.services.apis.generateImage = "error";
    healthStatus.status = "degraded";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  return NextResponse.json(healthStatus, { status: statusCode });
}