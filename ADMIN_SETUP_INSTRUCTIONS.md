# Admin Portal Setup Instructions

## For admin@example.com

### Option 1: Manual Setup via Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `travel-website`
3. **Navigate to Authentication**:
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email: `admin@example.com`
   - Set password: `YOUR_SECURE_PASSWORD`
   - Click "Add user"

4. **Set Admin Role**:
   - Go to Firestore Database
   - Create a new document in collection `users`
   - Document ID: Use the UID from the user you just created
   - Add these fields:
     ```
     email: "admin@example.com"
     displayName: "Saathvik Choudhary"
     role: "admin"
     createdAt: [current timestamp]
     lastLoginAt: [current timestamp]
     ```

### Option 2: Google Authentication (Alternative)

1. **Enable Google Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add authorized domains:
     - `localhost` (for development)
     - `travelwebsite.com` (for production)

2. **Sign in with Google**:
   - Go to https://travelwebsite.com/admin
   - Click "Sign in with Google"
   - Use your Google account (admin@example.com)

3. **Assign Admin Role**:
   - After signing in, get your UID from Firebase Console > Authentication > Users
   - Run: `node scripts/assign-admin-role.js <YOUR_UID>`

### Login Credentials (Option 1)

- **Email**: admin@example.com
- **Password**: YOUR_SECURE_PASSWORD
- **Admin Portal**: https://travelwebsite.com/admin

### What You Can Do in Admin Portal

- **Dashboard**: Overview of the website
- **Ride Management**: Add, edit, delete upcoming and previous rides
- **Hero Section**: Update the main banner content
- **Contact Info**: Manage contact information
- **Statistics**: View website analytics

### Security Notes

- Change the default password after first login
- The admin role is required to access the portal
- All changes are saved to Firebase Firestore
- The portal is protected by Firebase Authentication

### Troubleshooting

If you can't access the admin portal:
1. Check that Authentication is enabled in Firebase Console
2. Verify the user exists in Authentication > Users
3. Confirm the user document exists in Firestore with `role: "admin"`
4. Check browser console for any error messages

### Support

If you need help with the setup, the admin portal includes:
- User-friendly interface
- Real-time data updates
- Secure authentication
- Mobile-responsive design
