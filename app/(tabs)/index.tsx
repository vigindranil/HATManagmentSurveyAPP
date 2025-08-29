import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CircleCheck as CheckCircle,
  ArrowRight,
  ChartBar as BarChart3,
  Calendar,
  Target,
  Store,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDashboardCountBySurveyUserID,
  getNumberOfStallsPerMarketID,
} from '../../api';
import { useAuth } from '@/context/auth-context';
import { useDashboard } from '@/context/dashboard-context';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const { isOnline, pendingSurveys, getAllSurveys } = useOfflineStorage();
  const [totalSurveys, setTotalSurveys] = React.useState(156);
  const [dashboardData, setDashboardData] = useState<any>([]);
  const [stallData, setStallData] = useState<any>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const { needsRefresh } = useDashboard();
  const { setUser, setIsAuthenticated } = useAuth();

  React.useEffect(() => {
    loadSurveyStats();
  }, [pendingSurveys]);

  const loadSurveyStats = async () => {
    const allSurveys = await getAllSurveys();
    setTotalSurveys(allSurveys.length);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await AsyncStorage.getItem('user');
        if (user1) {
          const parsedUser = JSON.parse(user1);
          const parsedUser2 = JSON.parse(parsedUser.userDetails);
          if (parsedUser2) {
            setUserDetails(parsedUser2);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        if (error.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('user');
          router.replace('/(auth)/login');
        } else {
          console.error('Error fetching dashboard data', error);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function load() {
      if (userDetails && isOnline) {
        const Data = await getDashboardCountBySurveyUserID(userDetails.UserID);
        const stallData = await getNumberOfStallsPerMarketID(
          userDetails.UserID
        );
        setDashboardData(Data?.data);
        setStallData(stallData?.data);
      }
      else{
        setDashboardData([]);
        setStallData([]);
      }
    }
    load();
  }, [userDetails,needsRefresh,isOnline]);

  const stats = [
    {
      icon: FileText,
      title: 'Total Surveys',
      value: dashboardData?.total_survey?.toString() ?? '0',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      description: 'This month',
    },
    {
      icon: MapPin,
      title: 'Today Survey',
      value: dashboardData?.today_survey?.toString() ?? '0',
      color: '#0891B2',
      bgColor: '#F0FDFA',
      description: 'This Month',
    },
  ];

  // --- COLOR & ICON LOGIC ---
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          color: '#059669', // Emerald 600
          bgColor: '#F0FDF4', // Emerald 50
          icon: CheckCircle,
          gradient: ['#ffffff', '#F0FDF4'],
        };
      case 'In Progress':
        return {
          color: '#0891B2', // Cyan 600
          bgColor: '#F0FDFA', // Cyan 50
          icon: Clock,
          gradient: ['#ffffff', '#F0FDFA'],
        };
      case 'Pending':
        return {
          color: '#DC2626', // Red 600
          bgColor: '#FEF2F2', // Red 50
          icon: Clock,
          gradient: ['#ffffff', '#FEF2F2'],
        };
      default:
        return {
          color: '#6B7280', // Slate 500
          bgColor: '#F8FAFC', // Slate 50
          icon: Clock,
          gradient: ['#ffffff', '#F8FAFC'],
        };
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor="green"
        barStyle="dark-content"
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <OfflineIndicator />
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

          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.newSurveyButton}
              onPress={() => router.push('/survey')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10B981', '#34D399', '#6EE7B7']}
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
                    <Text style={styles.newSurveySubtitle}>
                      Begin data collection
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIcon,
                        { backgroundColor: stat.bgColor },
                      ]}
                    >
                      <stat.icon size={20} color={stat.color} />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <Text style={styles.statDescription}>{stat.description}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Surveys</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {stallData && stallData.length > 0 ? (
              stallData.map((survey: any) => {
                const statusDetails = getStatusDetails(survey.status);
                const StatusIcon = statusDetails.icon;

                return (
                  <TouchableOpacity
                    key={survey.market_id}
                    style={styles.surveyCardWrapper}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={statusDetails.gradient}
                      style={[
                        styles.surveyCard,
                        { borderLeftColor: statusDetails.color },
                      ]}
                    >
                      {/* --- UPDATED ICON CONTAINER --- */}
                      <View
                        style={[
                          styles.surveyIconContainer,
                          { backgroundColor: '#EFF6FF' }, // Always light blue
                        ]}
                      >
                        {/* --- ICON is now always blue --- */}
                        <Store size={22} color="#2563EB" />
                      </View>
                      <View style={styles.surveyInfo}>
                        <Text style={styles.surveyLocation} numberOfLines={1}>
                          {survey.market_name}
                        </Text>
                        <View style={styles.surveyMeta}>
                          <View style={styles.metaItem}>
                            <Users size={14} color={statusDetails.color} />
                            <Text style={styles.stallCount}>
                              <Text style={{ fontWeight: '600' }}>
                                {survey.number_of_stalls}
                              </Text>{' '}
                              stalls
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.surveyStatus,
                              { backgroundColor: statusDetails.bgColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: statusDetails.color },
                              ]}
                            >
                              {survey.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text
                style={{ textAlign: 'center', color: '#888', marginTop: 20 }}
              >
                No surveys
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 10,
    marginTop: 10,
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
    marginLeft: 5,
  },
  headerStatsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerStatsLabel: {
    fontSize: 10,
    color: '#BFDBFE',
    fontWeight: '500',
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
    shadowColor: '#10B981',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // --- STALL DATA CARD STYLES ---
  surveyCardWrapper: {
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  surveyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 5,
  },
  surveyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyLocation: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  surveyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stallCount: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '400',
    marginLeft: 6,
  },
  surveyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
});