// Environment configuration for Firebase
export const environment = {
  development: {
    firebase: {
      apiKey: "demo-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    }
  },
  production: {
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
  }
};

export const getCurrentEnvironment = () => {
  return import.meta.env.VITE_ENVIRONMENT || 'development';
};

export const getFirebaseConfig = () => {
  const env = getCurrentEnvironment();
  return environment[env]?.firebase || environment.development.firebase;
};
