// DEPRECATED: Firebase Admin compatibility layer
// This file has been deprecated - all functionality migrated to Supabase

// Removed warning console.log to prevent build warnings
// All functionality has been migrated to Supabase

// Stub admin functions
export const adminDb = {
  collection: (path: string) => {
    console.warn(`Firebase Admin collection() called with path: ${path}. Please migrate to Supabase.`);
    return {
      add: () => Promise.resolve({ id: 'temp-id' }),
      doc: (id: string) => ({
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: false, data: () => null })
      }),
      get: () => Promise.resolve({ docs: [] })
    };
  },
  doc: (path: string) => {
    console.warn(`Firebase Admin doc() called with path: ${path}. Please migrate to Supabase.`);
    return {
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: false, data: () => null })
    };
  }
};

export const adminStorage = {
  bucket: () => ({
    file: (path: string) => ({
      save: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      getSignedUrl: () => Promise.resolve(['temp-url'])
    })
  })
};

export const adminAuth = {
  deleteUser: (uid: string) => {
    console.warn(`Firebase Admin deleteUser() called with uid: ${uid}. Please migrate to Supabase.`);
    return Promise.resolve();
  },
  createUser: (userData: any) => {
    console.warn('Firebase Admin createUser() called. Please migrate to Supabase.');
    return Promise.resolve({ uid: 'temp-uid' });
  }
};

// Default export for Firebase Admin
export default {
  firestore: () => adminDb,
  storage: () => adminStorage,
  auth: () => adminAuth,
  initializeApp: () => {
    console.warn('Firebase Admin initializeApp() called. Please migrate to Supabase.');
  }
};