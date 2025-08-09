import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Alert,
  AppState,
  Platform,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';

interface LocationGuardProps {
  children: ReactNode;
}

const LocationGuard = ({ children }: LocationGuardProps) => {
  const [locationReady, setLocationReady] = useState(false);
  const appState = useRef(AppState.currentState);
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);
  const serviceStatusWatcher = useRef<number | null>(null);
  const isVerifying = useRef(false);

  const stopAllWatchers = () => {
    if (locationWatcher.current) locationWatcher.current.remove();
    if (serviceStatusWatcher.current) clearInterval(serviceStatusWatcher.current);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        verifyLocation();
      }
      appState.current = nextAppState;
    });

    handleInitialPrompt();
    return () => {
      subscription.remove();
      stopAllWatchers();
    };
  }, []);

  const exitApp = () => {
    if (Platform.OS === 'android') BackHandler.exitApp();
    else Alert.alert('Exit App', 'Please close the app manually.');
  };

  const handleInitialPrompt = () => {
    Alert.alert(
      'Location Required',
      'This app needs your location to function properly.',
      [
        { text: 'Cancel', onPress: exitApp, style: 'cancel' },
        { text: 'OK', onPress: () => verifyLocation() },
      ]
    );
  };

  const verifyLocation = async () => {
    if (isVerifying.current) return;
    isVerifying.current = true;
    stopAllWatchers();

    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
      }
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.', [
          { text: 'OK', onPress: exitApp },
        ]);
        isVerifying.current = false;
        return;
      }

      let enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Turn On Location',
          'Please enable location services (GPS) from your device settings.',
          [
            { text: 'Settings', onPress: () => Linking.openSettings() },
            { text: 'Exit', onPress: exitApp, style: 'cancel' },
          ]
        );
        isVerifying.current = false;
        return;
      }

      locationWatcher.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation },
        (location) => {
          if (location.mocked) {
            stopAllWatchers();
            Alert.alert('Mock Location', 'Mock locations are not allowed.', [
              { text: 'OK', onPress: exitApp },
            ]);
          }
        }
      );

      serviceStatusWatcher.current = setInterval(async () => {
        if (isVerifying.current) return;

        const stillEnabled = await Location.hasServicesEnabledAsync();
        if (!stillEnabled) {
          stopAllWatchers();
          setLocationReady(false);
          Alert.alert(
            'Location Turned Off',
            'Location is required to continue using this app.',
            [
              { text: 'Settings', onPress: () => Linking.openSettings() },
              { text: 'Exit', onPress: exitApp, style: 'cancel' },
            ]
          );
        }
      }, 3000);

      setLocationReady(true);
    } catch (error) {
      console.error("Location verification error:", error);
      Alert.alert('Location Error', 'An unexpected error occurred. Please enable location manually.', [
        { text: 'OK', onPress: exitApp },
      ]);
    } finally {
      isVerifying.current = false;
    }
  };

  if (!locationReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Verifying location...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
});

export default LocationGuard;
