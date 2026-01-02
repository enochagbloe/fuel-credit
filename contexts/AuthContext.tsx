import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, type AuthResponse, type User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure storage keys
const ACCESS_TOKEN_KEY = 'fuel_credit_access_token';
const REFRESH_TOKEN_KEY = 'fuel_credit_refresh_token';
const USER_DATA_KEY = 'fuel_credit_user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Store tokens and user data securely
  const storeAuthData = async (authResponse: AuthResponse) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, authResponse.tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, authResponse.tokens.refreshToken),
        SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(authResponse.user)),
      ]);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Clear all stored auth data
  const clearAuthData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_DATA_KEY),
      ]);
      // Don't set user to null here, let the calling function handle it
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Get stored access token
  const getAccessToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  // Register function
  const register = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.register(data);
      
      if (result.success && result.data) {
        // Don't auto-login after registration, redirect to login
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.login({ email, password });
      
      if (result.success && result.data) {
        await storeAuthData(result.data);
        return { success: true };
      } else {
        // Make error messages more user-friendly
        let errorMessage = result.error || 'Login failed';
        if (errorMessage.includes('Invalid credentials')) {
          errorMessage = 'Email or password is incorrect. Please check your credentials and try again.';
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    console.log('Logout initiated');
    
    try {
      const accessToken = await getAccessToken();
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (accessToken && refreshToken) {
        // Call logout API to invalidate tokens on server
        await authAPI.logout(accessToken, refreshToken);
      }
      
      // Clear stored data
      await clearAuthData();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
      await clearAuthData();
    } finally {
      // Always clear user state and stop loading
      setUser(null);
      setIsLoading(false);
      console.log('Logout completed - redirecting to login');
      // Redirect to login page after logout
      router.replace('/auth/login');
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const result = await authAPI.getProfile(accessToken);
      if (result.success && result.data) {
        setUser(result.data.user);
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(result.data.user));
      } else {
        // If profile fetch fails, user might be logged out
        await clearAuthData();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      await clearAuthData();
    }
  };

  // Initialize auth state on app start
  const initializeAuth = async () => {
    try {
      console.log('Initializing auth...');
      setIsLoading(true);
      
      // Get stored user data
      const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
      const accessToken = await getAccessToken();
      
      console.log('Stored user data exists:', !!storedUserData);
      console.log('Access token exists:', !!accessToken);
      
      if (storedUserData && accessToken) {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
        console.log('User restored from storage:', userData.firstName);
        
        // Verify token is still valid by refreshing user data
        await refreshUserData();
      } else {
        console.log('No stored auth data found');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await clearAuthData();
      setUser(null);
    } finally {
      console.log('Auth initialization complete');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};