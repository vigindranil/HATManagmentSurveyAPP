'use client';

import React, { Dispatch, SetStateAction, createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from './tokenManager';
import { jwtDecode } from 'jwt-decode';
import { ActivityIndicator, View } from 'react-native';

interface User {
  UserID: number;
  UserTypeID: number;
  UserType: string;
  UserName: string;
  UserFullName: string;
  UserPassword: string;
  UserRole: string;
  token?: string; // add token so we can validate
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  setReloadUser: (userData: User) => Promise<void>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setUser: Dispatch<SetStateAction<User | null>>;
  isAuthLoading: boolean;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isTokenValid(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000; // seconds
    return decoded.exp > now;
  } catch {
    return false;
  }
}

// --------------------------------------------------
// Context
// --------------------------------------------------
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Restore user from storage
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);

          if (parsedUser?.token && isTokenValid(parsedUser.token)){
            setAuthToken(parsedUser.token);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // remove invalid/expired
            await AsyncStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (e) {
        console.error('restoreUser error:', e);
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    };
    restoreUser();
  }, []);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------
  const login = async (token: string) => {
    if (!token) return;
    try {
      const decodedUser = jwtDecode<User>(token);
      const fullUser = { ...decodedUser, token };
      setAuthToken(token);
      setUser(fullUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(fullUser));
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  };

  // --------------------------------------------------
  // Reload user manually
  // --------------------------------------------------
  const setReloadUser = async (userData: User) => {
    const fullUser = { ...userData, token: userData.token ?? '' };
    setUser(fullUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('user', JSON.stringify(fullUser));
  };

  // --------------------------------------------------
  // Loading screen
  // --------------------------------------------------
  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        setReloadUser,
        setIsAuthenticated,
        setUser,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// Hook
// --------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
