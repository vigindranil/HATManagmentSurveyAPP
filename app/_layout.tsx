// File: app/_layout.tsx
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/auth-context";
import * as SplashScreen from "expo-splash-screen";
import SplashScreenComponent from "@/components/splash";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { ThemeProvider, useTheme } from "@/context/theme-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setTimeout(() => {
        setAppIsReady(true);
      }, 1500);
    }
  }, [fontsLoaded]);

  if (!appIsReady) {
    return <SplashScreenComponent />;
  }

  return (
    <>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={isDarkMode ? "#1e293b" : "white"}
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Always declare screens */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(app)/index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
