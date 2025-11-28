// contexts/AuthContext.tsx - UPDATED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isPollMonitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);


  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('🔄 Initializing auth:', {
        hasToken: !!token,
        hasUserData: !!userData,
        initialized
      });

      if (!token || !userData) {
        console.log('🔐 No stored auth data found');
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const userObj = JSON.parse(userData);

        // ✅ FIX: Set user immediately for better UX, then verify
        setUser(userObj);

        // Verify token is still valid with backend (but don't block UI)
        try {
          console.log('🔐 Verifying token with backend...');
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn('❌ Token verification failed, clearing auth');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            console.log('✅ Token verified successfully');
          }
        } catch (error) {
          console.warn('❌ Token verification failed (network error), but keeping local auth');
          // Keep user logged in even if verification fails (offline support)
        }
      } catch (error) {
        console.warn('❌ Invalid stored user data, clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeAuth();
    }
  }, [initialized]);

  // In your AuthContext.js - Update the login function
  const login = async (identifier: string, password: string, isAdmin = false) => {
    try {
      setLoading(true);
      console.log(`🔐 Attempting ${isAdmin ? 'admin' : 'voter'} login for:`, identifier);

      let response;
      if (isAdmin) {
        response = await api.post('/auth/admin/login', {
          email: identifier,
          password: password
        }, { skipAuth: true });
      } else {
        response = await api.post('/auth/voter/login', {
          emailOrStudentId: identifier,
          password: password
        }, { skipAuth: true });
      }

      const { token, user: userData } = response;

      console.log('✅ Login response received:', {
        hasToken: !!token,
        hasUserData: !!userData,
        userType: userData?.type,
        userRole: userData?.role,
        isActive: userData?.is_active // Log the active status
      });

      if (!token) {
        throw new Error('No authentication token received from server');
      }

      // Store auth data IMMEDIATELY
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update React state IMMEDIATELY
      setUser(userData);

      console.log(`✅ Login successful: ${userData?.type} ${userData?.email || userData?.studentId}, Active: ${userData?.is_active}`);

    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Clear any partial auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);

      // ✅ FIX: Check for inactive account error specifically
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('inactive')) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');

    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset state
    setUser(null);

    // Clear API queue
    api.clearQueue();

    console.log('✅ Logout completed');
  };

  // Check if current user is a poll monitor
  const isPollMonitor = user?.role === 'poll_monitor';

  // Debug current auth state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && initialized) {
      console.log('🔐 Auth State Updated:', {
        user: user ? {
          type: user.type,
          role: user.role,
          email: user.email,
          id: user.id
        } : null,
        isAuthenticated: !!user,
        tokenInStorage: !!localStorage.getItem('token'),
        loading,
        initialized
      });
    }
  }, [user, loading, initialized]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        isPollMonitor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};