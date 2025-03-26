import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { getUserProfile } from '../services/userService'; // Import profile fetching

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase auth user object
  const [userProfile, setUserProfile] = useState(null); // Firestore user profile data { username, email, ... }
  const [authLoading, setAuthLoading] = useState(true); // Initial auth check
  const [profileLoading, setProfileLoading] = useState(false); // Loading profile data
  const [profileMissing, setProfileMissing] = useState(false); // Flag if profile needs creation

  const fetchProfile = useCallback(async (firebaseUser) => {
    if (firebaseUser) {
      setProfileLoading(true);
      setProfileMissing(false);
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          // User is authenticated but has no profile document (e.g., old user)
          setUserProfile(null);
          setProfileMissing(true);
          console.log("User profile missing for:", firebaseUser.uid);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserProfile(null); // Clear profile on error
        // Optionally set an error state here
      } finally {
        setProfileLoading(false);
      }
    } else {
      // No Firebase user, clear profile state
      setUserProfile(null);
      setProfileMissing(false);
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      fetchProfile(currentUser); // Fetch profile whenever auth state changes
    });

    return () => unsubscribe();
  }, [fetchProfile]); // Include fetchProfile in dependency array

  // Function to manually refresh profile after creation
  const refreshUserProfile = useCallback(() => {
    if (user) {
      fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const value = {
    user, // Firebase auth object
    userProfile, // Firestore profile { username, email, ... }
    isAuthenticated: !!user,
    isGuest: !user,
    authLoading, // Loading Firebase auth state
    profileLoading, // Loading Firestore profile
    profileMissing, // Needs to create profile?
    refreshUserProfile // Function to re-fetch profile
  };

  // Render children only after initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
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
