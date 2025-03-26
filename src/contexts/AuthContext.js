import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import the initialized auth service
// Removed unused imports: getCurrentUser, initializeStorage

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This will hold the Firebase user object
  const [loading, setLoading] = useState(true); // Still useful to track initial auth state check

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser is the Firebase user object or null
      setLoading(false); // Auth state determined, no longer loading
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  const value = {
    user, // Provide the Firebase user object
    // setUser is no longer needed externally as state is managed by onAuthStateChanged
    isAuthenticated: !!user, // True if user object exists, false if null
    isGuest: !user, // True if user object is null
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
