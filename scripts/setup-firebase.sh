#!/bin/bash

# Firebase project setup script
# This script helps initialize Firebase project and configure environment

set -e  # Exit on any error

echo "🔥 Setting up Firebase project..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing now..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "🔐 Please login to Firebase..."
firebase login

# Initialize Firebase project
echo "🚀 Initializing Firebase project..."
firebase init

# Create environment file
echo "📝 Creating environment configuration..."

cat > .env.local << EOF
# Firebase Configuration
# Replace these values with your actual Firebase project configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Environment
VITE_ENVIRONMENT=production
EOF

echo "✅ Environment file created: .env.local"
echo "📋 Please update .env.local with your actual Firebase configuration values"

# Install Firebase dependencies
echo "📦 Installing Firebase dependencies..."
npm install firebase

# Install functions dependencies
echo "⚡ Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

echo "🎉 Firebase setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your Firebase project configuration"
echo "2. Create your first admin user using the admin setup script"
echo "3. Run 'npm run dev' to start development server"
echo "4. Run './scripts/deploy.sh' to deploy to Firebase"
