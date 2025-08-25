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
  const isAlertVisible = useRef(false);

  useEffect(() => {
    isAlertVisible.current = alertInfo !== null;
  }, [alertInfo]);

  const verifyAndShowPrompts = async () => {
    try {
      setIsVerifying(true);

      // 1. Permission check
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          setLocationReady(false);
          setAlertInfo({
            title: 'Permission Denied',
            message:
              'Location permission is required. Please grant permission in your settings.',
            buttons: [
              { text: 'Settings', onPress: handleSettingsPress },
              { text: 'Exit', onPress: exitApp, style: 'cancel' },
            ],
          });
          setIsVerifying(false);
          return;
        }
      }

      // 2. Location services
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationReady(false);
        setAlertInfo({
          title: 'Location Error',
          message: 'Your location is turned off.',
          buttons: [{ text: 'OK', onPress: showTurnOnLocationPrompt }],
        });
        setIsVerifying(false);
        return;
      }

      // 3. Mock location check
      const location = await Location.getCurrentPositionAsync();
      if (location.mocked) {
        setLocationReady(false);
        setAlertInfo({
          title: 'Mock Location',
          message:
            'Mock locations are not allowed. Please disable them to continue.',
          buttons: [{ text: 'Exit', onPress: exitApp }],
        });
        setIsVerifying(false);
        return;
      }

      // Success
      setAlertInfo(null);
      setLocationReady(true);
      setIsVerifying(false);
    } catch (error) {
      setLocationReady(false);
      setAlertInfo({
        title: 'Location Error',
        message:
          'An unexpected error occurred. Please check your location settings.',
        buttons: [{ text: 'Exit', onPress: exitApp }],
      });
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

  // Continuous check (detect GPS from anywhere)
  useEffect(() => {
    const continuousCheck = async () => {
      const enabled = await Location.hasServicesEnabledAsync();
      if (enabled && isAlertVisible.current) {
        setIsVerifying(true);
        await verifyAndShowPrompts();
      } else if (!enabled && !isAlertVisible.current) {
        await verifyAndShowPrompts();
      }
    };

    verifyAndShowPrompts();
    const intervalId = setInterval(continuousCheck, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const exitApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      setAlertInfo({
        title: 'Exit App',
        message: 'Please close the app manually.',
        buttons: [],
      });
    }
  };

  const handleSettingsPress = async () => {
    await Linking.openSettings();
    // Verification will be done automatically by continuousCheck
  };

  const showTurnOnLocationPrompt = () => {
    setAlertInfo({
      title: 'Turn On Location',
      message: 'Please enable location services (GPS) to continue.',
      buttons: [
        { text: 'Settings', onPress: handleSettingsPress },
        { text: 'Exit', onPress: exitApp, style: 'cancel' },
      ],
    });
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
                    onPress={button.onPress}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#6c757d' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  verifyText :{ fontWeight: 'bold', fontSize: 16, marginTop: 10 },
});

export default LocationGuard;
