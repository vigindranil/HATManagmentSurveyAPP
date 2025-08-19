import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/auth-context';
import { AlertNotificationRoot } from 'react-native-alert-notification';



export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
    <AlertNotificationRoot>
      <StatusBar style="dark" backgroundColor="white" translucent={false} />
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          {/* <Stack.Screen name="index" /> */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthProvider>
      </AlertNotificationRoot>
    </>
  );
}
