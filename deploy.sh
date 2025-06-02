#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with required environment variables."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p deploy
cp -r .next deploy/
cp -r public deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp .env.local deploy/

# Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf division-orderly-deploy.tar.gz deploy/

# Cleanup
rm -rf deploy/

echo "✅ Deployment package created: division-orderly-deploy.tar.gz"
echo "Transfer this file to your server and extract it to deploy."
echo "Then run: npm install --production && npm start" 