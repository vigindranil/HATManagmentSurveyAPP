import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SurveyData {
  id: string;
  timestamp: number;
  synced: boolean;
  data: {
    // Location Details
    district: string;
    subDivision: string;
    block: string;
    gramPanchayat: string;
    village: string;
    latitude: string;
    longitude: string;
    
    // Shop/Stall Details
    slNo: string;
    registerNo: string;
    stallNo: string;
    presentRent: string;
    shopType: string;
    mode: string;
    natureOfUser: string;
    residential: string;
    commercial: string;
    vacant: string;
    totalArea: string;
    typeOfStructure: string;
    
    // Possession Details
    possessionName: string;
    fatherHusbandName: string;
    possessionReceived: string;
    lr: string;
    rs: string;
    khatianNo: string;
    
    // License & Plan Information
    buildingPlanApproved: string;
    licenseIssued: string;
    pendingIssues: string;
    
    // Contact & Identity Information
    aadharA: string;
    aadharB: string;
    mobileA: string;
    mobileB: string;
    
    // Remarks
    remarks: string;
  };
}

const STORAGE_KEYS = {
  SURVEYS: '@hat_surveys',
  SYNC_QUEUE: '@hat_sync_queue',
  LAST_SYNC: '@hat_last_sync',
};

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSurveys, setPendingSurveys] = useState<SurveyData[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Load pending surveys and last sync time
    loadPendingSurveys();
    loadLastSyncTime();

    return () => unsubscribe();
  }, []);

  const loadPendingSurveys = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SURVEYS);
      if (stored) {
        const surveys: SurveyData[] = JSON.parse(stored);
        setPendingSurveys(surveys.filter(survey => !survey.synced));
      }
    } catch (error) {
      console.error('Error loading pending surveys:', error);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (stored) {
        setLastSyncTime(parseInt(stored));
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };

  const saveSurveyOffline = async (surveyData: Omit<SurveyData, 'id' | 'timestamp' | 'synced'>) => {
    try {
      const survey: SurveyData = {
        id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        synced: false,
        data: surveyData.data,
      };

      // Get existing surveys
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SURVEYS);
      const existingSurveys: SurveyData[] = stored ? JSON.parse(stored) : [];
      
      // Add new survey
      const updatedSurveys = [...existingSurveys, survey];
      
      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(updatedSurveys));
      
      // Update pending surveys state
      setPendingSurveys(prev => [...prev, survey]);
      
      // Try to sync immediately if online
      if (isOnline) {
        syncSurveys();
      }

      return survey.id;
    } catch (error) {
      console.error('Error saving survey offline:', error);
      throw error;
    }
  };

  const syncSurveys = async () => {
    if (!isOnline || syncInProgress) return;

    setSyncInProgress(true);
    
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SURVEYS);
      if (!stored) return;

      const surveys: SurveyData[] = JSON.parse(stored);
      const unsyncedSurveys = surveys.filter(survey => !survey.synced);

      if (unsyncedSurveys.length === 0) {
        setSyncInProgress(false);
        return;
      }

      // Simulate API sync (replace with actual API calls)
      for (const survey of unsyncedSurveys) {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mark as synced
          survey.synced = true;
          
          console.log(`Survey ${survey.id} synced successfully`);
        } catch (error) {
          console.error(`Failed to sync survey ${survey.id}:`, error);
          // Keep survey as unsynced for retry
        }
      }

      // Update storage with synced status
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
      
      // Update last sync time
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
      setLastSyncTime(now);
      
      // Update pending surveys state
      setPendingSurveys(surveys.filter(survey => !survey.synced));
      
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const getAllSurveys = async (): Promise<SurveyData[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SURVEYS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all surveys:', error);
      return [];
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SURVEYS);
      if (!stored) return;

      const surveys: SurveyData[] = JSON.parse(stored);
      const filteredSurveys = surveys.filter(survey => survey.id !== surveyId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(filteredSurveys));
      setPendingSurveys(prev => prev.filter(survey => survey.id !== surveyId));
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SURVEYS,
        STORAGE_KEYS.SYNC_QUEUE,
        STORAGE_KEYS.LAST_SYNC,
      ]);
      setPendingSurveys([]);
      setLastSyncTime(null);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return {
    isOnline,
    pendingSurveys,
    syncInProgress,
    lastSyncTime,
    saveSurveyOffline,
    syncSurveys,
    getAllSurveys,
    deleteSurvey,
    clearAllData,
  };
};