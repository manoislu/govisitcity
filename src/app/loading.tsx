export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}

// Désactiver le prerendering pour cette page
export const dynamic = 'auto'