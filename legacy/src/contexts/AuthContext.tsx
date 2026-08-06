import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | { uid: string, email: string } | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | { uid: string, email: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser((prevUser) => {
        // If we have a mocked user already, don't override it with null from Firebase
        if (!currentUser && prevUser && 'uid' in prevUser && prevUser.uid === 'mock_admin_123') {
          return prevUser;
        }
        return currentUser;
      });
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role_id || 'Standard User');
          } else {
            setUserRole('Standard User');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('Standard User');
        }
      } else {
        setUserRole((prevRole) => {
           // If we're keeping the mock user, keep the role too
           if (prevRole === 'System Admin') return prevRole;
           return null;
        });
      }
      setLoading(false);
    });

    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (email === 'admin@jazanhospital.com' && password === 'admin123') {
      setUser({ uid: 'mock_admin_123', email: 'admin@jazanhospital.com' });
      setUserRole('System Admin');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
        throw new Error('Firebase Authentication (Email/Password) is not enabled for this project. Please use admin@jazanhospital.com / admin123 to log in via the mock override.');
      }
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setUserRole(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
