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
              createdAt: new Date(userData.createdAt),
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
        createdAt: new Date(userData.createdAt),
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
        createdAt: new Date(userData.createdAt),
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
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to send password reset email');
      }

      // Success - email sent
      return;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP(email, otpCode);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid or expired OTP code');
      }

      // Return userId for password reset
      return response.data.userId;
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(error.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithToken = async (email: string, otpCode: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // First verify OTP to get userId
      const userId = await verifyOTP(email, otpCode);
      
      // Then reset password with userId
      const response = await authApi.resetPassword(userId, newPassword);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password');
      }

      // Success - password reset
      return;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    try {
      const response = await authApi.updateProfile(data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile');
      }

      const userData = response.data.user;
      
      // Update local user state with the new data
      const userWithType = {
        ...userData,
        createdAt: new Date(userData.createdAt),
        type: userData.role === 'ORGANIZER' ? 'organizer' as const : 'user' as const,
        joinedAt: new Date(userData.createdAt),
      };
      
      setUser(userWithType);
      localStorage.setItem('cc_user', JSON.stringify(userWithType));
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      verifyOTP,
      resetPasswordWithToken,
      updateProfile
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