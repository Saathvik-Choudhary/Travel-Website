#!/bin/bash

# Firebase deployment script for Biking Website
# This script handles building and deploying the application to Firebase

set -e  # Exit on any error

echo "🚀 Starting Firebase deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Build the React application
echo "📦 Building React application..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ React application built successfully"

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."

# Deploy hosting
echo "📡 Deploying hosting..."
firebase deploy --only hosting

# Deploy functions
echo "⚡ Deploying functions..."
firebase deploy --only functions

# Deploy Firestore rules
echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

echo "🎉 Deployment completed successfully!"
echo "🌐 Your website is now live at: https://your-project-id.web.app"
