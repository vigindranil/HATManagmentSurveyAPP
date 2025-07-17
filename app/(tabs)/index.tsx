import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, MapPin, Users, TrendingUp, Plus, Clock, CircleCheck as CheckCircle, ArrowRight, ChartBar as BarChart3, Calendar, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const { pendingSurveys, getAllSurveys } = useOfflineStorage();
  const [totalSurveys, setTotalSurveys] = React.useState(156);

  React.useEffect(() => {
    loadSurveyStats();
  }, [pendingSurveys]);

  const loadSurveyStats = async () => {
    const allSurveys = await getAllSurveys();
    setTotalSurveys(allSurveys.length);
  };

  const stats = [
    { 
      icon: FileText, 
      title: 'Total Surveys', 
      value: totalSurveys.toString(), 
      change: '+12%',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      description: 'This month'
    },
    { 
      icon: MapPin, 
      title: 'Locations', 
      value: '24', 
      change: '+3',
      color: '#0891B2',
      bgColor: '#F0FDFA',
      description: 'Active areas'
    },
    { 
      icon: Users, 
      title: 'Respondents', 
      value: '89', 
      change: '+18%',
      color: '#059669',
      bgColor: '#F0FDF4',
      description: 'Unique users'
    },
    { 
      icon: Clock, 
      title: 'Pending Sync', 
      value: pendingSurveys.length.toString(), 
      change: pendingSurveys.length > 0 ? 'Offline' : 'Synced',
      color: '#DC2626',
      bgColor: '#FEF2F2',
      description: 'Offline surveys'
    },
  ];

  const recentSurveys = [
    { 
      id: 1, 
      location: 'Kolkata Municipal Area', 
      status: 'Completed', 
      date: '2 hours ago',
      progress: 100,
      stallCount: 12
    },
    { 
      id: 2, 
      location: 'Howrah District', 
      status: 'In Progress', 
      date: '1 day ago',
      progress: 65,
      stallCount: 8
    },
    { 
      id: 3, 
      location: 'North 24 Parganas', 
      status: 'Pending', 
      date: '2 days ago',
      progress: 0,
      stallCount: 15
    },
  ];

  const quickActions = [
    { icon: Plus, title: 'New Survey', color: '#2563EB', route: '/survey' },
    { icon: BarChart3, title: 'Analytics', color: '#7C3AED', route: '/reports' },
    { icon: Calendar, title: 'Schedule', color: '#059669', route: '/reports' },
    { icon: Target, title: 'Goals', color: '#DC2626', route: '/reports' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#059669';
      case 'In Progress': return '#0891B2';
      case 'Pending': return '#DC2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'In Progress': return Clock;
      case 'Pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#F0FDF4';
      case 'In Progress': return '#F0FDFA';
      case 'Pending': return '#FEF2F2';
      default: return '#F8FAFC';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Offline Indicator */}
        <OfflineIndicator />
        
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#1E40AF', '#2563EB', '#3B82F6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerGreeting}>Good Morning</Text>
              <Text style={styles.headerTitle}>HAT Management</Text>
              <Text style={styles.headerSubtitle}>Survey Dashboard</Text>
            </View>
            <View style={styles.headerStats}>
              <Text style={styles.headerStatsNumber}>{totalSurveys}</Text>
              <Text style={styles.headerStatsLabel}>Total Surveys</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[action.color, action.color + '90']}
                  style={styles.quickActionGradient}
                >
                  <action.icon size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <View style={styles.statChange}>
                    <Text style={[styles.changeText, { color: stat.color }]}>{stat.change}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statDescription}>{stat.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* New Survey CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.newSurveyButton}
            onPress={() => router.push('/survey')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6', '#60A5FA']}
              style={styles.newSurveyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.newSurveyContent}>
                <View style={styles.newSurveyIcon}>
                  <Plus size={24} color="#ffffff" />
                </View>
                <View style={styles.newSurveyText}>
                  <Text style={styles.newSurveyTitle}>Start New Survey</Text>
                  <Text style={styles.newSurveySubtitle}>Begin data collection</Text>
                </View>
                <ArrowRight size={20} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Surveys */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Surveys</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentSurveys.map((survey) => {
            const StatusIcon = getStatusIcon(survey.status);
            return (
              <TouchableOpacity key={survey.id} style={styles.surveyCard} activeOpacity={0.7}>
                <View style={styles.surveyCardContent}>
                  <View style={styles.surveyInfo}>
                    <View style={styles.surveyHeader}>
                      <Text style={styles.surveyLocation}>{survey.location}</Text>
                      <Text style={styles.surveyDate}>{survey.date}</Text>
                    </View>
                    
                    <View style={styles.surveyMeta}>
                      <Text style={styles.stallCount}>{survey.stallCount} stalls</Text>
                      <View style={[styles.surveyStatus, { backgroundColor: getStatusBgColor(survey.status) }]}>
                        <StatusIcon size={14} color={getStatusColor(survey.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(survey.status) }]}>
                          {survey.status}
                        </Text>
                      </View>
                    </View>

                    {survey.status === 'In Progress' && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${survey.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{survey.progress}% complete</Text>
                      </View>
                    )}
                  </View>
                  
                  <ArrowRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStatsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerStatsLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  newSurveyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  newSurveyGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  newSurveyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newSurveyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  newSurveyText: {
    flex: 1,
  },
  newSurveyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  newSurveySubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  surveyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  surveyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surveyInfo: {
    flex: 1,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  surveyLocation: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  surveyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  surveyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stallCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  surveyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0891B2',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});