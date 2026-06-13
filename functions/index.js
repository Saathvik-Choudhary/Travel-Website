// Firebase Cloud Functions for Biking Website
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// Helper function to check if user is admin
const isAdmin = async (uid) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper function to authenticate admin requests
const authenticateAdmin = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new functions.https.HttpsError('unauthenticated', 'No valid authentication token');
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const isUserAdmin = await isAdmin(decodedToken.uid);
    
    if (!isUserAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    
    return decodedToken;
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Invalid authentication token');
  }
};

// API: Send notification email
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Authenticate admin
    await authenticateAdmin(req);

    const { message, type = 'info' } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Store notification in Firestore
    await db.collection('notifications').add({
      message,
      type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    res.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get website analytics
exports.getAnalytics = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Authenticate admin
    await authenticateAdmin(req);

    // Get analytics data
    const [ridesSnapshot, usersSnapshot] = await Promise.all([
      db.collection('rides').get(),
      db.collection('users').get()
    ]);

    const totalRides = ridesSnapshot.size;
    const upcomingRides = ridesSnapshot.docs.filter(doc => 
      doc.data().status === 'upcoming'
    ).length;
    const completedRides = ridesSnapshot.docs.filter(doc => 
      doc.data().status === 'completed'
    ).length;
    const totalUsers = usersSnapshot.size;

    const analytics = {
      totalRides,
      upcomingRides,
      completedRides,
      totalUsers,
      lastUpdated: new Date().toISOString()
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Bulk update ride statuses
exports.bulkUpdateRides = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Authenticate admin
    await authenticateAdmin(req);

    const { rideIds, status } = req.body;

    if (!rideIds || !Array.isArray(rideIds) || !status) {
      res.status(400).json({ error: 'rideIds array and status are required' });
      return;
    }

    // Update rides in batch
    const batch = db.batch();
    
    for (const rideId of rideIds) {
      const rideRef = db.collection('rides').doc(rideId);
      batch.update(rideRef, {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();

    res.json({ 
      success: true, 
      message: `Updated ${rideIds.length} rides to ${status}` 
    });
  } catch (error) {
    console.error('Error bulk updating rides:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Clean up old data
exports.cleanupData = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Authenticate admin
    await authenticateAdmin(req);

    const { daysOld = 365 } = req.body;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Clean up old notifications
    const notificationsSnapshot = await db.collection('notifications')
      .where('createdAt', '<', cutoffDate)
      .get();

    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({ 
      success: true, 
      message: `Cleaned up ${notificationsSnapshot.size} old notifications` 
    });
  } catch (error) {
    console.error('Error cleaning up data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scheduled function: Daily analytics update
exports.dailyAnalyticsUpdate = functions.pubsub
  .schedule('0 0 * * *') // Run daily at midnight
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    try {
      console.log('Running daily analytics update...');
      
      // Get current stats
      const statsDoc = await db.collection('stats').doc('main').get();
      const currentStats = statsDoc.exists ? statsDoc.data() : {};
      
      // Get ride counts
      const ridesSnapshot = await db.collection('rides').get();
      const completedRides = ridesSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      ).length;
      
      // Update stats
      await db.collection('stats').doc('main').set({
        completedRides,
        lastAnalyticsUpdate: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log('Daily analytics update completed');
    } catch (error) {
      console.error('Error in daily analytics update:', error);
    }
  });

// Trigger: Update stats when ride status changes
exports.onRideStatusChange = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed
    if (before.status !== after.status) {
      console.log(`Ride ${context.params.rideId} status changed from ${before.status} to ${after.status}`);
      
      // Update global stats
      const statsRef = db.collection('stats').doc('main');
      const statsDoc = await statsRef.get();
      const currentStats = statsDoc.exists ? statsDoc.data() : {};
      
      let completedRides = currentStats.completedRides || 0;
      
      if (after.status === 'completed' && before.status !== 'completed') {
        completedRides += 1;
      } else if (before.status === 'completed' && after.status !== 'completed') {
        completedRides = Math.max(0, completedRides - 1);
      }
      
      await statsRef.set({
        completedRides,
        lastStatsUpdate: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  });
