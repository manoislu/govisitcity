import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📄 API export-pdf called!')
    
    const { title, city, startDate, endDate, participants, budget, itinerary } = await request.json()
    console.log('📄 Request data:', { title, city, startDate, endDate, participants })

    if (!title || !city || !itinerary) {
      console.log('❌ Missing required data')
      return NextResponse.json(
        { error: 'Missing required data: title, city, itinerary' },
        { status: 400 }
      )
    }

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML({ title, city, startDate, endDate, participants, budget, itinerary })
    
    // For now, return a simple text-based PDF simulation
    // In a real implementation, you would use a PDF library like puppeteer or jsPDF
    console.log('📄 Generating PDF content...')
    
    const pdfContent = `
Voyage à ${city}
==================

Dates: ${formatDate(startDate)} - ${formatDate(endDate)}
Participants: ${participants} personne(s)
Budget: ${budget || 'Non spécifié'}

Itinéraire:
${itinerary.map((day: any) => `
Jour ${day.day} - ${day.date}
${day.activities.map((activity: any) => `
  • ${activity.name} (${activity.duration})
    ${activity.description}
    Catégorie: ${activity.category} | Prix: ${activity.price}
`).join('')}
`).join('')}

Généré le ${new Date().toLocaleDateString('fr-FR')}
par GoVisitCity
    `.trim()

    // Create a blob-like response
    const response = new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="voyage-${city.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt"`,
      },
    })

    console.log('✅ PDF exported successfully')
    return response

  } catch (error) {
    console.error('💥 ERROR in export-pdf API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generatePDFHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; }
        .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .day { margin-bottom: 30px; }
        .day-header { background: #e5e7eb; padding: 10px; font-weight: bold; }
        .activity { margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; }
    </style>
</head>
<body>
    <h1>${data.title}</h1>
    <div class="header">
        <p><strong>Dates:</strong> ${formatDate(data.startDate)} - ${formatDate(data.endDate)}</p>
        <p><strong>Participants:</strong> ${data.participants} personne(s)</p>
        <p><strong>Budget:</strong> ${data.budget || 'Non spécifié'}</p>
    </div>
    
    ${data.itinerary.map((day: any) => `
    <div class="day">
        <div class="day-header">Jour ${day.day} - ${day.date}</div>
        ${day.activities.map((activity: any) => `
        <div class="activity">
            <strong>${activity.name}</strong> (${activity.duration})<br>
            ${activity.description}<br>
            <small>Catégorie: ${activity.category} | Prix: ${activity.price}</small>
        </div>
        `).join('')}
    </div>
    `).join('')}
    
    <hr>
    <p><em>Généré le ${new Date().toLocaleDateString('fr-FR')} par GoVisitCity</em></p>
</body>
</html>
  `
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Non spécifiée'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}