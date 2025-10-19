#!/bin/bash

echo "🚀 Starting production build process..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local with default values..."
    cat > .env.local << EOF
# Database
DATABASE_URL="file:./db/custom.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Z-AI SDK (optional - will use defaults if not provided)
ZAI_API_KEY=""
ZAI_BASE_URL=""

# Production settings
NODE_ENV="production"
EOF
    echo "✅ .env.local created with default values"
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️ Pushing database schema..."
npm run db:push

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Production build completed successfully!"
echo "🎯 To start the production server, run: npm start"