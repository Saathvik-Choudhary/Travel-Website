# 🔥 Firebase Deployment Guide

This guide will help you deploy your Biking Website to Firebase with full backend functionality.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase account
- Git repository

## 🚀 Quick Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
npm run firebase:init
```

Select the following services:
- ✅ Hosting
- ✅ Firestore
- ✅ Functions
- ✅ Storage
- ✅ Authentication

### 4. Configure Environment

Create `.env.local` file with your Firebase configuration:

```bash
# Copy the example file
cp .env.example .env.local
```

Update `.env.local` with your actual Firebase project values:
- Go to Firebase Console → Project Settings → General
- Copy the configuration values

### 5. Install Dependencies

```bash
# Install main dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

## 👤 Admin Setup

### Create First Admin User

```bash
npm run admin:setup admin@yourdomain.com yourpassword "Admin Name"
```

Replace with your actual email, password, and display name.

## 🛠️ Development

### Start Development Server

```bash
npm run dev
```

### Start Firebase Emulators

```bash
npm run firebase:emulators
```

This will start:
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Storage Emulator: http://localhost:9199
- Emulator UI: http://localhost:4000

## 🚀 Deployment

### Deploy Everything

```bash
npm run firebase:deploy
```

This will deploy:
- ✅ React frontend to Firebase Hosting
- ✅ Cloud Functions
- ✅ Firestore security rules
- ✅ Storage security rules
- ✅ Firestore indexes

### Deploy Individual Services

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

## 📊 Firebase Services Used

### 1. **Firebase Hosting**
- Hosts your React application
- Automatic HTTPS
- Global CDN
- Custom domain support

### 2. **Firebase Authentication**
- Admin portal security
- Email/password authentication
- Role-based access control

### 3. **Cloud Firestore**
- Real-time database
- Stores all website content
- Collections: `heroSlides`, `rides`, `config`, `stats`, `users`

### 4. **Cloud Functions**
- Backend API endpoints
- Scheduled tasks
- Database triggers
- Analytics processing

### 5. **Firebase Storage**
- Image uploads
- File management
- Secure file access

## 🗄️ Database Schema

### Collections Structure

```
/heroSlides/{slideId}
  - title, subtitle, tagline
  - background (image URL)
  - cta, order, isActive
  - createdAt, updatedAt

/rides/{rideId}
  - title, date, duration, distance
  - description, image, participants
  - status (upcoming/completed/cancelled)
  - featured, createdAt, updatedAt

/config/{configId}
  - company (name, email, phone, location)
  - socialMedia (instagram, youtube, whatsapp)
  - googleForm

/stats/{statsId}
  - completedRides, happyRiders
  - kilometersCovered, monthsOfAdventure

/users/{userId}
  - email, displayName, role
  - createdAt, lastLoginAt
```

## 🔐 Security Rules

### Firestore Rules
- Public read access for website content
- Admin write access for content management
- User management with role-based permissions

### Storage Rules
- Public read access for images
- Admin write access for uploads

## 📈 Monitoring & Analytics

### Firebase Console
- Monitor usage and performance
- View logs and errors
- Manage users and authentication

### Cloud Functions Logs
```bash
firebase functions:log
```

### Real-time Monitoring
- Database usage
- Function invocations
- Storage usage
- Authentication events

## 💰 Cost Optimization

### Free Tier Limits
- **Hosting**: 1GB storage, 10GB/month transfer
- **Firestore**: 50K reads/writes/day
- **Auth**: 10K monthly active users
- **Functions**: 2M invocations/month
- **Storage**: 5GB

### Cost-Effective Scaling
- Start with free tier
- Monitor usage in Firebase Console
- Upgrade to Blaze plan when needed
- Pay only for what you use

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Firebase CLI Issues**
   ```bash
   # Update Firebase CLI
   npm install -g firebase-tools@latest
   ```

3. **Environment Variables**
   - Ensure `.env.local` is properly configured
   - Check Firebase project settings
   - Verify API keys are correct

4. **Permission Errors**
   - Check Firestore security rules
   - Verify user authentication
   - Ensure admin role is set

### Debug Mode

```bash
# Enable debug logging
export DEBUG=firebase:*
npm run dev
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🎯 Next Steps

1. **Custom Domain**: Configure your own domain in Firebase Hosting
2. **Analytics**: Set up Google Analytics for Firebase
3. **Performance**: Monitor and optimize with Firebase Performance
4. **Notifications**: Add Firebase Cloud Messaging for push notifications
5. **Backup**: Set up automated database backups

---

🎉 **Your Biking Website is now ready for Firebase deployment!**

For support, check the Firebase documentation or create an issue in your repository.
