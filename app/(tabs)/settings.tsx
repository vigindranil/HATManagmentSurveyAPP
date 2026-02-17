import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  LogOut,
  ChevronRight,
  Moon,
} from 'lucide-react-native';
import { useAuth } from '../../context/auth-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '@/components/CustomAlert';

import { Colors, useTheme } from '@/context/theme-context';

// Define the AlertInfo type locally since the type was missing and throwing a lint error
type AlertInfo = {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function Settings() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const activeColors = Colors[theme];

  // Create a user state to hold user information
  const [userState, setUserState] = React.useState<any>(null);

  const { setIsAuthenticated, setUser } = useAuth();

  // CustomAlert state info
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    visible: false,
    type: 'success',
    message: '',
    onConfirm: undefined,
    onCancel: undefined,
  });

  // --- Helper for forced logout when user missing ---
  const handleForceLogout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('user');
    setAlertInfo((prev) => ({ ...prev, visible: false }));
    router.replace('/(auth)/login');
  };

  /**
   * Custom alert confirm handler that calls the onConfirm handler from alertInfo and closes the alert.
   */
  const handleAlertConfirm = async () => {
    if (alertInfo.onConfirm) {
      await alertInfo.onConfirm();
    }
    setAlertInfo((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  /**
   * Custom alert cancel handler that calls the onCancel handler from alertInfo (if any) and closes the alert.
   */
  const handleAlertCancel = () => {
    if (alertInfo.onCancel) {
      alertInfo.onCancel();
    }
    setAlertInfo((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await AsyncStorage.getItem('user');
        if (user1) {
          const parsedUser = JSON.parse(user1);
          const parsedUser2 = JSON.parse(parsedUser.userDetails);
          if (parsedUser2) {
            setUserState(parsedUser2);
            return;
          }
        }
        // If we reach here, user not found
        setAlertInfo({
          visible: true,
          type: 'Unauthorized',
          message: 'Your session has expired or user not found. Logging out...',
          onConfirm: handleForceLogout,
          onCancel: handleForceLogout,
        });
      } catch (error) {
        // If error fetching user, also force logout
        setAlertInfo({
          visible: true,
          type: 'Unauthorized',
          message: 'There was an error verifying your session. Logging out...',
          onConfirm: handleForceLogout,
          onCancel: handleForceLogout,
        });
        console.error('Error Users data', error);
      }
    };
    fetchUser();
    // We want to run only once at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSignOut = () => {
    setAlertInfo({
      visible: true,
      type: 'warning',
      message: 'Are you sure you want to sign out?',
      onConfirm: async () => {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('user');
        setAlertInfo((prev) => ({ ...prev, visible: false }));
        router.replace('/(auth)/login');
      },
      onCancel: () => setAlertInfo((prev) => ({ ...prev, visible: false })),
    });
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
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: Moon,
          title: 'Dark Mode',
          subtitle: 'Toggle dark theme',
          hasSwitch: true,
          switchValue: isDarkMode,
          onSwitchToggle: toggleTheme,
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
          <item.icon size={24} color={item.danger ? '#DC2626' : (isDarkMode ? '#94a3b8' : '#64748b')} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: activeColors.text }, item.danger && styles.dangerText]}>
            {item.title}
          </Text>
          <Text style={[styles.settingSubtitle, { color: activeColors.subtext }]}>{item.subtitle}</Text>
        </View>
        {item.hasSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchToggle}
            trackColor={{ false: isDarkMode ? '#334155' : '#f3f4f6', true: isDarkMode ? '#1e40af' : '#dbeafe' }}
            thumbColor={item.switchValue ? '#2563EB' : '#9ca3af'}
          />
        )}
        {item.hasArrow && <ChevronRight size={20} color="#9ca3af" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top']}>
      {alertInfo.visible && (
        <CustomAlert
          type={alertInfo.type}
          message={alertInfo.message}
          onConfirm={handleAlertConfirm}
          onCancel={handleAlertCancel}
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: activeColors.header }]}>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: activeColors.subtext }]}>Manage Your Preferences</Text>
        </View>

        {/* User Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: activeColors.card }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {userState?.UserFullName ? userState.UserFullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: activeColors.text }]}>{userState?.UserFullName}</Text>
            {/* <Text style={styles.profileEmail}>john.doe@example.com</Text> */}
          </View>
        </View>

        {/* Settings Sections */}
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? activeColors.text : '#374151' }]}>{section.section}</Text>
            <View style={[styles.sectionContent, { backgroundColor: activeColors.card }]}>
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
  scrollContent: {
    paddingBottom: 40,
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
