#!/bin/bash

# Test Deployment Script
# This script helps verify that the build process works correctly

echo "🚴 Testing Biking Website Deployment Setup..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Run linting
echo "🔍 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Linting issues found. Consider fixing them before deployment."
else
    echo "✅ Linting passed"
fi

# Build the project
echo "🏗️  Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if dist folder was created
if [ -d "dist" ]; then
    echo "✅ Dist folder created"
    echo "📁 Build output:"
    ls -la dist/
else
    echo "❌ Error: Dist folder not found"
    exit 1
fi

# Check if GitHub Actions workflow exists
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions workflow found"
else
    echo "❌ Error: GitHub Actions workflow not found"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your deployment setup is ready."
echo ""
echo "Next steps:"
echo "1. Commit and push your changes to the 'saathvik' branch"
echo "2. Enable GitHub Pages in your repository settings"
echo "3. Check the Actions tab to monitor deployment"
echo ""
echo "Your site will be available at: https://[your-username].github.io/[repository-name]"
