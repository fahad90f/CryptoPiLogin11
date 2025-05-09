import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize the Firebase Admin SDK
// In a production environment, you would use service account credentials JSON file
// For simplicity, we're using the application default credentials
export const app = initializeApp({
  projectId: 'test-51d9b',
  // Other optional configurations can be added here
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