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
  Plus,
  Clock,
  CircleCheck as CheckCircle,
  ArrowRight,
  Store,
  ClipboardList
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDashboardCountBySurveyUserID,
  getNumberOfStallsPerMarketID,
} from '../../api';
import { useAuth } from '@/context/auth-context';
import { useDashboard } from '@/context/dashboard-context';
import CustomAlert from '@/components/CustomAlert';
import { Colors, useTheme } from '@/context/theme-context';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const activeColors = Colors[theme];

  const { isOnline, pendingSurveys, getAllSurveys } = useOfflineStorage();
  const [totalSurveys, setTotalSurveys] = React.useState(156);
  const [dashboardData, setDashboardData] = useState<any>([]);
  const [stallData, setStallData] = useState<any>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const { needsRefresh } = useDashboard();
  const { setUser, setIsAuthenticated } = useAuth();
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    type: 'success', // 'success' or 'error'
    message: '',
    context: undefined as string | undefined,
  });

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
        } else {
          setAlertInfo({
            visible: true,
            type: 'Unauthorized',
            message: 'Unable to find user.',
            context: 'Cannot_find',
          });
        }
      } catch (error) {
        setAlertInfo({
          visible: true,
          type: 'Unauthorized',
          message: 'Unable to find user.',
          context: 'Cannot_find',
        });
        console.error('Error fetching dashboard data', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        if (userDetails && isOnline) {
          const Data = await getDashboardCountBySurveyUserID(userDetails.UserID);
          const stallDataResp = await getNumberOfStallsPerMarketID(
            userDetails.UserID
          );

          if (Data?.status === 0) {
            setDashboardData(Data?.data);
          } else {
            alert("Something went wrong while fetching dashboard data.");
            setDashboardData([]);
          }
          if (stallDataResp?.status === 0) {
            setStallData(stallDataResp?.data);
          } else {
            alert("Something went wrong while fetching dashboard data.");
            setStallData([]);
          }
        } else {
          setDashboardData([]);
          setStallData([]);
        }
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        if (error.status === 401) {
          setAlertInfo({
            visible: true,
            type: 'Unauthorized',
            message: 'Your session has expired. Please log in again.',
            context: 'unauthorized_access',
          });
          return;
        } else {
          setAlertInfo({
            visible: true,
            type: 'Something went wrong',
            message: 'Something went wrong while fetching dashboard data.',
            context: 'Something_went_wrong',
          });
          setDashboardData([]);
          setStallData([]);
        }
      }
    }
    load();
  }, [userDetails, needsRefresh, isOnline]);

  const stats = [
    {
      icon: FileText,
      title: 'Total Surveys',
      value: dashboardData?.total_survey?.toString() ?? '0',
      color: '#2563EB',
      bgColor: isDarkMode ? '#1e293b' : '#EFF6FF',
      description: 'This month',
    },
    {
      icon: MapPin,
      title: 'Today Survey',
      value: dashboardData?.today_survey?.toString() ?? '0',
      color: '#0891B2',
      bgColor: isDarkMode ? '#164e63' : '#F0FDFA',
      description: 'This Month',
    },
  ];

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          color: '#059669',
          bgColor: isDarkMode ? '#064e3b' : '#F0FDF4',
          icon: CheckCircle,
          gradient: isDarkMode ? [activeColors.card, '#064e3b'] as const : ['#ffffff', '#F0FDF4'] as const,
        };
      case 'In Progress':
        return {
          color: '#0891B2',
          bgColor: isDarkMode ? '#164e63' : '#F0FDFA',
          icon: Clock,
          gradient: isDarkMode ? [activeColors.card, '#164e63'] as const : ['#ffffff', '#F0FDFA'] as const,
        };
      case 'Pending':
        return {
          color: '#DC2626',
          bgColor: isDarkMode ? '#7f1d1d' : '#FEF2F2',
          icon: Clock,
          gradient: isDarkMode ? [activeColors.card, '#7f1d1d'] as const : ['#ffffff', '#FEF2F2'] as const,
        };
      default:
        return {
          color: '#6B7280',
          bgColor: isDarkMode ? '#334155' : '#F8FAFC',
          icon: Clock,
          gradient: isDarkMode ? [activeColors.card, '#334155'] as const : ['#ffffff', '#F8FAFC'] as const,
        };
    }
  };

  const handleAlertConfirm = () => {
    setAlertInfo({ ...alertInfo, visible: false });
    if (alertInfo.context === 'unauthorized_access') {
      setUser(null);
      setIsAuthenticated(false);
      AsyncStorage.removeItem('user').then(() => {
        router.replace('/(auth)/login');
      });
    }
    if (alertInfo.context === 'Cannot_find') {
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={isDarkMode ? activeColors.header : "green"}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
        {alertInfo.visible && (
          <CustomAlert
            type={alertInfo.type}
            message={alertInfo.message}
            onConfirm={handleAlertConfirm}
          />
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <OfflineIndicator />
          <LinearGradient
            colors={isDarkMode ? ['#1e293b', '#0f172a'] as const : ['#1E40AF', '#2563EB', '#3B82F6'] as const}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerGreeting}>Welcome</Text>
                <Text style={styles.headerTitle}>{userDetails?.UserFullName}</Text>
                <Text style={styles.headerSubtitle}>Survey Dashboard</Text>
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
                    <Text style={styles.newSurveySubtitle}>Begin Data Collection</Text>
                  </View>
                  <ArrowRight size={20} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Overview</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={[styles.statCard, { backgroundColor: activeColors.card }]}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                      <stat.icon size={20} color={stat.color} />
                    </View>
                  </View>
                  <Text style={[styles.statValue, { color: activeColors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statTitle, { color: activeColors.text }]}>{stat.title}</Text>
                  <Text style={[styles.statDescription, { color: activeColors.subtext }]}>{stat.description}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.headerSubtitle, { color: activeColors.subtext }]}>Overview Of Your Surveys</Text>
            </View>

            {stallData && stallData.length > 0 ? (
              stallData.map((survey: any) => {
                const statusDetails = getStatusDetails(survey.status);
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
                      <View style={[styles.surveyIconContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#EFF6FF' }]}>
                        <ClipboardList size={22} color={activeColors.primary} />
                      </View>
                      <View style={styles.surveyInfo}>
                        <Text style={[styles.surveyLocation, { color: activeColors.text }]} numberOfLines={1}>
                          {survey.market_name}
                        </Text>
                        <View style={styles.surveyMeta}>
                          <View style={styles.metaItem}>
                            <Store size={14} color={activeColors.primary} />
                            <View style={[styles.activebox, { backgroundColor: '#83b910d4' }]}>
                              <Text style={{ fontWeight: '600', fontSize: 11, color: '#fff' }}>
                                {`Active : ${survey?.active_no_of_stalls}`}
                              </Text>
                            </View>
                            <View style={[styles.inactivebox, { backgroundColor: '#ef4444d0' }]}>
                              <Text style={{ fontWeight: '600', fontSize: 11, color: '#fff' }}>
                                {`Inactive : ${survey?.inactive_no_of_stalls}`}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.surveyStatus, { backgroundColor: statusDetails.bgColor }]}>
                            <Text style={[styles.statusText, { color: statusDetails.color }]}>
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
              <Text style={{ textAlign: 'center', color: activeColors.subtext, marginTop: 20 }}>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderRadius: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  newSurveyButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
  surveyCardWrapper: {
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
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
  activebox: {
    padding: 5,
    borderRadius: 10,
    marginLeft: 5,
  },
  inactivebox: {
    padding: 5,
    borderRadius: 10,
    marginLeft: 5,
  },
  surveyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});