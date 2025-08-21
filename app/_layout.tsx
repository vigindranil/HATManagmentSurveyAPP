// File: app/_layout.tsx

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/auth-context';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenComponent from '@/components/splash';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuth } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isAuthLoading } = useAuth();
  
  // Use the user and loading state from your AuthContext
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Use a state to control the app's readiness
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // This is the main loading check
    if (fontsLoaded && !isAuthLoading) {
      // Hide the native splash screen
      SplashScreen.hideAsync();
      
      // We can introduce a small delay here for a better UX
      setTimeout(() => {
        setAppIsReady(true);
      }, 3000); // Wait for the custom splash screen to finish
    }
  }, [fontsLoaded, isAuthLoading]);

  if (!appIsReady) {
    // This will now handle the custom splash screen and its logic
    return <SplashScreenComponent />;
  }
  
  // If the user is authenticated, they should be redirected to the main app flow
 
    // If not authenticated, show the login screen
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="+not-found" />
      </Stack>
    );
  
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="white" translucent={false} />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </>
  );
}