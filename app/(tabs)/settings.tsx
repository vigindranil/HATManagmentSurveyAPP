import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Shield,
  Download,
  LogOut,
  ChevronRight,
  Globe,
  Moon,
  Database,
  Trash2,
} from 'lucide-react-native';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { SurveyList } from '@/components/SurveyList';
import { useAuth } from '../../context/auth-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  // Create a user state to hold user information
  const [userState, setUserState] = React.useState(null);

  const [showSurveyList, setShowSurveyList] = React.useState(false);
  const { clearAllData, pendingSurveys } = useOfflineStorage();
  const { setIsAuthenticated, setUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await AsyncStorage.getItem('user');
        console.log(user1);
        if (user1) {
          const parsedUser = JSON.parse(user1);
          const parsedUser2 = JSON.parse(parsedUser.userDetails);
          if (parsedUser2) {
            setUserState(parsedUser2);
          }
        }
      } catch (error) {
        console.error('Error Users data', error);
        //   if (error.status === 401) {
        //     logout(); // 👈 handle it here
        //   } else {
        //     console.error('Error fetching dashboard data', error);
        // }
      }
    };
    fetchUser();
  }, []);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all saved surveys. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllData,
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setUser(null);
          setIsAuthenticated(false);
          await AsyncStorage.removeItem('user');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const settingsItems = [
    {
      section: 'Account',
      items: [
        {
          icon: User,
          title: 'Profile Settings',
          subtitle: 'Edit your profile information',
          hasArrow: true,
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your security settings',
          hasArrow: true,
        },
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Push notifications for updates',
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchToggle: setNotificationsEnabled,
        },
        {
          icon: Moon,
          title: 'Dark Mode',
          subtitle: 'Toggle dark theme',
          hasSwitch: true,
          switchValue: darkMode,
          onSwitchToggle: setDarkMode,
        },
        {
          icon: Globe,
          title: 'Language',
          subtitle: 'English (US)',
          hasArrow: true,
        },
      ],
    },
    {
      section: 'Data & Storage',
      items: [
        {
          icon: Database,
          title: 'Saved Surveys',
          subtitle: `${pendingSurveys.length} pending sync`,
          hasArrow: true,
          onPress: () => setShowSurveyList(true),
        },
        {
          icon: Download,
          title: 'Data Export',
          subtitle: 'Export your survey data',
          hasArrow: true,
        },
        {
          icon: Trash2,
          title: 'Clear All Data',
          subtitle: 'Delete all saved surveys',
          hasArrow: true,
          danger: true,
          onPress: handleClearData,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          icon: LogOut,
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          hasArrow: true,
          danger: true,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.settingItem}
        onPress={item?.onPress}
      >
        <View style={styles.settingIcon}>
          <item.icon size={24} color={item.danger ? '#DC2626' : '#64748b'} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, item.danger && styles.dangerText]}>
            {item.title}
          </Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        {item.hasSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchToggle}
            trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
            thumbColor={item.switchValue ? '#2563EB' : '#9ca3af'}
          />
        )}
        {item.hasArrow && <ChevronRight size={20} color="#9ca3af" />}
      </TouchableOpacity>
    );
  };

  if (showSurveyList) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSurveyList(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Surveys</Text>
        </View>
        <SurveyList />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userState?.UserFullName}</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfile}>
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HAT Management Survey v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  editProfile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  editProfileText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  dangerText: {
    color: '#DC2626',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  versionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});
