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

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
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
    <Stack screenOptions={{ headerShown: false }}>
      {/* Always declare screens */}
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(app)/index" />
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
