import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Trash2, Clock, CircleCheck as CheckCircle, Wifi, WifiOff } from 'lucide-react-native';
import { useOfflineStorage, SurveyData } from '@/hooks/useOfflineStorage';

export const SurveyList = () => {
  const { getAllSurveys, deleteSurvey, isOnline } = useOfflineStorage();
  const [surveys, setSurveys] = useState<SurveyData[]>([]);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    const allSurveys = await getAllSurveys();
    setSurveys(allSurveys.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDeleteSurvey = (surveyId: string) => {
    Alert.alert(
      'Delete Survey',
      'Are you sure you want to delete this survey?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSurvey(surveyId);
            loadSurveys();
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (surveys.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No surveys saved yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Saved Surveys ({surveys.length})</Text>
      
      {surveys.map((survey) => (
        <View key={survey.id} style={styles.surveyCard}>
          <View style={styles.surveyHeader}>
            <View style={styles.surveyInfo}>
              <Text style={styles.surveyTitle}>
                {survey.data.district} - {survey.data.village}
              </Text>
              <Text style={styles.surveySubtitle}>
                Stall: {survey.data.stallNo || 'N/A'}
              </Text>
              <Text style={styles.surveyDate}>
                {formatDate(survey.timestamp)}
              </Text>
            </View>
            
            <View style={styles.surveyActions}>
              <View style={[
                styles.statusBadge,
                survey.synced ? styles.syncedBadge : styles.pendingBadge
              ]}>
                {survey.synced ? (
                  <CheckCircle size={12} color="#059669" />
                ) : (
                  <Clock size={12} color="#DC2626" />
                )}
                <Text style={[
                  styles.statusText,
                  survey.synced ? styles.syncedText : styles.pendingText
                ]}>
                  {survey.synced ? 'Synced' : 'Pending'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSurvey(survey.id)}
              >
                <Trash2 size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.surveyDetails}>
            <Text style={styles.detailText}>
              Owner: {survey.data.possessionName || 'N/A'}
            </Text>
            <Text style={styles.detailText}>
              Type: {survey.data.shopType || 'N/A'}
            </Text>
            <Text style={styles.detailText}>
              Area: {survey.data.totalArea || 'N/A'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  surveyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  surveySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  surveyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  surveyActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  syncedBadge: {
    backgroundColor: '#F0FDF4',
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  syncedText: {
    color: '#059669',
  },
  pendingText: {
    color: '#DC2626',
  },
  deleteButton: {
    padding: 4,
  },
  surveyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});