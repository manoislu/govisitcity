// Test script to verify the API works
const testAPI = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/more-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: 'Paris',
        theme: 'Culture',
        existingActivities: [],
        budget: '€€',
        participants: 2
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API Response:', JSON.stringify(data, null, 2))
    console.log(`✅ Found ${data.activities.length} activities`)
  } catch (error) {
    console.error('❌ API Test failed:', error)
  }
}

testAPI()