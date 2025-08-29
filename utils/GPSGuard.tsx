import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Modal,
  AppState,
  Platform,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Linking,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';


// --- Global ref to indicate if camera is open ---
export const isCameraOpenRef = { current: false };

interface AlertInfo {
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: 'cancel' | 'default';
  }[];
}

interface LocationGuardProps {
  children: ReactNode;
}

const LocationGuard = ({ children }: LocationGuardProps) => {
  const [locationReady, setLocationReady] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const appState = useRef(AppState.currentState);
  const locationEnabledRef = useRef<boolean | null>(null);
  const verificationMutex = useRef(false); // prevent parallel checks

  const verifyAndShowPrompts = async () => {
    if (verificationMutex.current || isCameraOpenRef.current) return; // skip if camera is open
    verificationMutex.current = true;
    setIsVerifying(true);

    try {
      // 1. Permission check
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          setLocationReady(false);
          setAlertInfo({
            title: 'Permission Denied',
            message: 'Location permission is required. Please grant permission in your settings.',
            buttons: [
              { text: 'Settings', onPress: handleSettingsPress },
              { text: 'Exit', onPress: exitApp, style: 'cancel' },
            ],
          });
          return;
        }
      }

      // 2. Location services check
      const enabled = await Location.hasServicesEnabledAsync();
      locationEnabledRef.current = enabled;
      if (!enabled) {
        setLocationReady(false);
        setAlertInfo({
          title: 'Location Error',
          message: 'Your location is turned off. Please turn it on to continue.',
          buttons: [
            { text: 'Settings', onPress: handleSettingsPress },
            { text: 'Exit', onPress: exitApp, style: 'cancel' },
          ],
        });
        return;
      }

      // 3. Mock location check (safe call)
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
          mayShowUserSettingsDialog: false,
        });

        if (location?.mocked) {
          setLocationReady(false);
          setAlertInfo({
            title: 'Mock Location',
            message: 'Mock locations are not allowed. Please disable them to continue.',
            buttons: [{ text: 'Exit', onPress: exitApp }],
          });
          return;
        }
      } catch (err: any) {
        if (
          err?.message?.includes('location provider is unavailable') ||
          err?.message?.includes('E_LOCATION_TIMEOUT') ||
          err?.message?.includes('E_LOCATION_UNAVAILABLE')
        ) {
          console.log('Location temporarily unavailable, retrying silently...');
        } else {
          setLocationReady(false);
          setAlertInfo({
            title: 'Location Error',
            message: 'Could not fetch location. Please ensure your GPS has a clear signal and try again.',
            buttons: [
              { text: 'Retry', onPress: verifyAndShowPrompts },
              { text: 'Exit', onPress: exitApp },
            ],
          });
        }
        return;
      }

      // Success
      setAlertInfo(null);
      setLocationReady(true);

    } finally {
      verificationMutex.current = false;
      setIsVerifying(false);
    }
  };

  // AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        verifyAndShowPrompts();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  // Continuous lightweight service check
  useEffect(() => {
    const continuousCheck = async () => {
      if (isCameraOpenRef.current) return; // skip check if camera is open
      const enabled = await Location.hasServicesEnabledAsync();
      if (enabled !== locationEnabledRef.current) {
        verifyAndShowPrompts();
      }
    };

    verifyAndShowPrompts(); // initial check
    const intervalId = setInterval(continuousCheck, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const exitApp = () => {
    if (Platform.OS === 'android') BackHandler.exitApp();
    else setAlertInfo({ title: 'Exit App', message: 'Please close the app manually.', buttons: [] });
  };

  const handleSettingsPress = async () => {
    
    // await Linking.openURL("android.settings.LOCATION_SOURCE_SETTINGS"); 
    await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
   
  };

  if (locationReady) return <>{children}</>;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>Verifying location...</Text>

      <Modal
        transparent
        animationType="fade"
        visible={alertInfo !== null}
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{alertInfo?.title}</Text>
            <Text style={styles.modalMessage}>{alertInfo?.message}</Text>

            {isVerifying ? (
              <View>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.verifyText}>Checking...</Text>
              </View>
            ) : (
              <View style={styles.modalButtonContainer}>
                {alertInfo?.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalButton,
                      button.style === 'cancel' && styles.cancelButton,
                    ]}
                    onPress={() => {
                      if (button.text !== 'Settings') setAlertInfo(null);
                      button.onPress();
                    }}
                  >
                    <Text style={styles.modalButtonText}>{button.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  modalButton: { flex: 1, padding: 10, marginHorizontal: 5, backgroundColor: '#007BFF', borderRadius: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#6c757d' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  verifyText: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
});

export default LocationGuard;
