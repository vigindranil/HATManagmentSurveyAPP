'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from './tokenManager';
import { jwtDecode } from 'jwt-decode';

interface User {
  UserID: number;
  UserTypeID: number;
  UserType: string;
  UserName: string;
  UserFullName: string;
  UserPassword: string;
  UserRole: string;
}

// Define the AuthContext type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  // logout: () => void;
  setReloadUser: (userData: User) => Promise<void>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>; 
  setUser :  Dispatch<SetStateAction<User | null>>; // <-- update this line
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Restore user from AsyncStorage on mount
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    };
    restoreUser();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the login page if not authenticated
      // router.replace("/splash")
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'home') {
      // Redirect to the splash page if authenticated and not already navigating to splash
      // router.replace("/")
    }
  }, [isAuthenticated, segments, isAuthLoading]);

  // Login function
  const login = async (token: string) => {
    if (token) {
      try {
        const decodedUser = (await jwtDecode(token)) as User;
        setAuthToken(token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user', JSON.stringify(decodedUser));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  };

  const setReloadUser = async (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    getAllAsyncStorageData();
  };

  const getAllAsyncStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys(); // Get all keys
      const result = await AsyncStorage.multiGet(keys); // Get all values

      result.forEach(([key, value]) => {
        console.log(`Key: ${key}, Value: ${value}`);
      });
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  };

 

  // Logout function
  // const logout = async () => {

  //   console.log("logout");
  //     setUser(null);
  //     setIsAuthenticated(false);
  //     await AsyncStorage.removeItem('user');
  //   const user1 = await AsyncStorage.getItem('user');
  //   console.log("user",user1);
  //   // router.replace("/");
  // };

  if (isAuthLoading) {
    // Optionally render a splash/loading indicator here
    return null;
  }

  return (
    <AuthContext.Provider
    value={{ isAuthenticated, user, login, setReloadUser, setIsAuthenticated, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
