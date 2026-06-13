#!/bin/bash

# Firebase Services Setup Script for Biking Website
# This script sets up all required Firebase services

set -e  # Exit on any error

echo "🔥 Setting up Firebase services for Biking Website..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    print_status "Checking Firebase CLI..."
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI not found. Please install it first:"
        print_error "npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI is installed"
}

# Check if logged in
check_firebase_login() {
    print_status "Checking Firebase authentication..."
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase. Please run: firebase login"
        exit 1
    fi
    print_success "Logged in to Firebase"
}

# Create Firestore database
setup_firestore() {
    print_status "Setting up Firestore database..."
    
    # Check if Firestore is already enabled
    if firebase firestore:databases:list &> /dev/null; then
        print_success "Firestore already configured"
        return 0
    fi
    
    print_warning "Firestore database needs to be created in Firebase Console"
    print_warning "Please visit: https://console.firebase.google.com/project/travel-website/firestore"
    print_warning "Click 'Create database' and choose 'Start in test mode'"
    print_warning "Then run this script again"
    
    return 1
}

# Setup Authentication
setup_auth() {
    print_status "Setting up Firebase Authentication..."
    
    print_warning "Authentication needs to be enabled in Firebase Console"
    print_warning "Please visit: https://console.firebase.google.com/project/travel-website/authentication"
    print_warning "Go to 'Sign-in method' tab and enable 'Email/Password'"
    print_warning "Then run this script again"
}

# Setup Storage
setup_storage() {
    print_status "Setting up Firebase Storage..."
    
    print_warning "Storage needs to be enabled in Firebase Console"
    print_warning "Please visit: https://console.firebase.google.com/project/travel-website/storage"
    print_warning "Click 'Get started' and choose 'Start in test mode'"
    print_warning "Then run this script again"
}

# Deploy Firestore rules
deploy_firestore_rules() {
    print_status "Deploying Firestore security rules..."
    
    if [ -f "firestore.rules" ]; then
        firebase deploy --only firestore:rules
        print_success "Firestore rules deployed"
    else
        print_warning "firestore.rules file not found"
    fi
}

# Deploy Storage rules
deploy_storage_rules() {
    print_status "Deploying Storage security rules..."
    
    if [ -f "storage.rules" ]; then
        firebase deploy --only storage
        print_success "Storage rules deployed"
    else
        print_warning "storage.rules file not found"
    fi
}

# Main setup function
main() {
    echo "🔥 Firebase Services Setup for Biking Website"
    echo "============================================="
    
    # Check prerequisites
    check_firebase_cli
    check_firebase_login
    
    # Setup services
    print_status "Setting up required Firebase services..."
    
    # Try to setup Firestore
    if setup_firestore; then
        deploy_firestore_rules
    fi
    
    # Setup Authentication
    setup_auth
    
    # Setup Storage
    setup_storage
    
    # Deploy rules
    deploy_storage_rules
    
    print_success "Firebase services setup completed!"
    
    echo ""
    print_warning "Manual steps required:"
    print_warning "1. Create Firestore database: https://console.firebase.google.com/project/travel-website/firestore"
    print_warning "2. Enable Authentication: https://console.firebase.google.com/project/travel-website/authentication"
    print_warning "3. Enable Storage: https://console.firebase.google.com/project/travel-website/storage"
    print_warning "4. Run this script again after completing manual steps"
}

# Run main function
main "$@"
