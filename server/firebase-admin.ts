import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize the Firebase Admin SDK using environment variables
export const app = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'cryptopilot',
  // Using application default credentials for simplicity
  // In production, you would use a service account file or environment variables
});

export const auth = getAuth(app);

export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw error;
  }
};

export default app;