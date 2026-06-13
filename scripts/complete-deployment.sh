#!/bin/bash

# Complete Firebase Deployment Script for Biking Website
# This script handles the entire deployment process

set -e  # Exit on any error

echo "🚀 Starting Complete Firebase Deployment for Biking Website..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    print_status "Checking Firebase CLI installation..."
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Installing now..."
        npm install -g firebase-tools
    else
        print_success "Firebase CLI is installed"
    fi
}

# Check Firebase login status
check_firebase_login() {
    print_status "Checking Firebase authentication..."
    if firebase projects:list &> /dev/null; then
        print_success "Already logged in to Firebase"
        return 0
    else
        print_warning "Not logged in to Firebase"
        return 1
    fi
}

# Build the React application
build_react_app() {
    print_status "Building React application..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "React application built successfully"
}

# Install functions dependencies
install_functions_deps() {
    print_status "Installing Cloud Functions dependencies..."
    cd functions
    npm install
    cd ..
    print_success "Functions dependencies installed"
}

# Create environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        print_warning "Creating .env.local from template..."
        cp .env.example .env.local
        print_warning "Please update .env.local with your Firebase project configuration"
        print_warning "You can get these values from Firebase Console → Project Settings → General"
    else
        print_success "Environment file already exists"
    fi
}

# Main deployment function
deploy_to_firebase() {
    print_status "Deploying to Firebase..."
    
    # Deploy hosting
    print_status "Deploying hosting..."
    firebase deploy --only hosting
    
    # Deploy functions
    print_status "Deploying functions..."
    firebase deploy --only functions
    
    # Deploy Firestore rules
    print_status "Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    # Deploy Firestore indexes
    print_status "Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes
    
    # Deploy Storage rules
    print_status "Deploying Storage rules..."
    firebase deploy --only storage
    
    # Initialize Firebase database with default data
    print_status "Initializing Firebase database with default data..."
    if [ -f "scripts/initialize-firebase-data.js" ]; then
        node scripts/initialize-firebase-data.js
        print_success "Database initialized with default data"
    else
        print_warning "Database initialization script not found, skipping..."
    fi
    
    print_success "All services deployed successfully!"
}

# Main execution
main() {
    echo "🔥 Firebase Deployment for Biking Website"
    echo "=========================================="
    
    # Check prerequisites
    check_firebase_cli
    
    # Check if logged in
    if ! check_firebase_login; then
        print_error "Please login to Firebase first:"
        print_error "Run: firebase login"
        print_error "Then run this script again"
        exit 1
    fi
    
    # Build application
    build_react_app
    
    # Install dependencies
    install_functions_deps
    
    # Setup environment
    setup_environment
    
    # Deploy to Firebase
    deploy_to_firebase
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Your website is now live at: https://your-project-id.web.app"
    print_status "Admin portal: https://your-project-id.web.app/admin"
    
    echo ""
    print_warning "Next steps:"
    print_warning "1. Update .env.local with your Firebase configuration"
    print_warning "2. Create admin user: npm run admin:setup admin@yourdomain.com password123 'Admin Name'"
    print_warning "3. Test your website and admin portal"
}

# Run main function
main "$@"
