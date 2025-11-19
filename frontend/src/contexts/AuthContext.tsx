'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/lib/types';
import { authApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session
    const checkAuth = async () => {
      const token = localStorage.getItem('cc_auth_token');
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            const userData = response.data.user;
            // Add legacy type field for backward compatibility
            const userWithType = {
              ...userData,
              type: userData.role === 'ORGANIZER' ? 'organizer' as const : 'user' as const,
              joinedAt: new Date(userData.createdAt),
            };
            setUser(userWithType);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('cc_auth_token');
            localStorage.removeItem('cc_user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid auth data
          localStorage.removeItem('cc_auth_token');
          localStorage.removeItem('cc_user');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { user: userData, token } = response.data;
      
      // Add legacy type field for backward compatibility
      const userWithType = {
        ...userData,
        type: userData.role === 'ORGANIZER' ? 'organizer' as const : 'user' as const,
        joinedAt: new Date(userData.createdAt),
      };
      
      setUser(userWithType);
      localStorage.setItem('cc_auth_token', token);
      localStorage.setItem('cc_user', JSON.stringify(userWithType));
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, type: 'user' | 'organizer') => {
    setIsLoading(true);
    try {
      const role = type === 'organizer' ? 'ORGANIZER' : 'USER';
      const response = await authApi.register({
        name,
        email,
        password,
        role,
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }

      const { user: userData, token } = response.data;
      
      // Add legacy type field for backward compatibility
      const userWithType = {
        ...userData,
        type: userData.role === 'ORGANIZER' ? 'organizer' as const : 'user' as const,
        joinedAt: new Date(userData.createdAt),
      };
      
      setUser(userWithType);
      localStorage.setItem('cc_auth_token', token);
      localStorage.setItem('cc_user', JSON.stringify(userWithType));
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('cc_auth_token');
    localStorage.removeItem('cc_user');
  };

  const resetPassword = async (email: string) => {
    // TODO: Implement password reset API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Password reset is not yet implemented');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
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