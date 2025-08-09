import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, RefreshCw, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

export const OfflineIndicator = () => {
  const { isOnline, pendingSurveys, syncInProgress, lastSyncTime, syncSurveys } = useOfflineStorage();

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, isOnline ? styles.online : styles.offline]}>
        <View style={styles.statusLeft}>
          {isOnline ? (
            <Wifi size={16} color="#ffffff" />
          ) : (
            <WifiOff size={16} color="#ffffff" />
          )}
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        {pendingSurveys.length > 0 && (
          <View style={styles.pendingBadge}>
            <Clock size={12} color="#ffffff" />
            <Text style={styles.pendingText}>{pendingSurveys.length}</Text>
          </View>
        )}
      </View>

      {(pendingSurveys.length > 0 || lastSyncTime) && (
        <View style={styles.syncInfo}>
          <View style={styles.syncDetails}>
            {pendingSurveys.length > 0 && (
              <Text style={styles.pendingInfo}>
                {pendingSurveys.length} survey{pendingSurveys.length !== 1 ? 's' : ''} pending sync
              </Text>
            )}
            <Text style={styles.lastSync}>
              Last sync: {formatLastSync(lastSyncTime)}
            </Text>
          </View>
          
          {isOnline && pendingSurveys.length > 0 && (
            <TouchableOpacity 
              style={[styles.syncButton, syncInProgress && styles.syncButtonDisabled]}
              onPress={syncSurveys}
              disabled={syncInProgress}
            >
              {syncInProgress ? (
                <RefreshCw size={16} color="#2563EB" style={styles.spinning} />
              ) : (
                <RefreshCw size={16} color="#2563EB" />
              )}
              <Text style={styles.syncButtonText}>
                {syncInProgress ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  online: {
    backgroundColor: '#059669',
  },
  offline: {
    backgroundColor: '#DC2626',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  syncDetails: {
    flex: 1,
  },
  pendingInfo: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  lastSync: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 4,
  },
  spinning: {
    // Add rotation animation if needed
  },
});