import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  Button, 
  ActivityIndicator, 
  Linking, 
  BackHandler,
  AppState
} from 'react-native';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';





const OfflineWrapper = ({ children } : any) => {
  // Use the isOnline state from your custom hook
  const { isOnline } = useOfflineStorage();
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);






  const handleOpenSettings = () => {
    // This will open the general settings on Android and iOS
    Linking.openSettings();
  };

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  if (isOnline) {
    return <>{children}</>;
  }

  return (
    <Modal visible={!isOnline} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.modalContainer}>
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>You are Offline</Text>
          <Text style={styles.alertMessage}>
            Please turn on your internet connection to continue using the app.
          </Text>

          {isCheckingConnection ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loaderText}>Checking Connection...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button title="Open Settings" onPress={handleOpenSettings} />
              <View style={{ marginHorizontal: 10 }} />
              <Button title="Exit App" onPress={handleExitApp} color="#FF3B30" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alertBox: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#555',
    lineHeight: 22,
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default OfflineWrapper;