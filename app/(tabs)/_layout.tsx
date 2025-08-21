import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  FileText,
  ChartBar as BarChart3,
  Settings,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GPSGuard from '@/utils/GPSGuard';
import { DashboardProvider } from '@/context/dashboard-context';


export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <DashboardProvider>
      <GPSGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: (insets?.bottom ?? 0) + 8,
              paddingTop: 5,
              height: 62 + (insets?.bottom ?? 0),
            },
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#6b7280',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="survey"
            options={{
              title: 'Survey',
              tabBarIcon: ({ size, color }) => (
                <FileText size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="reports"
            options={{
              title: 'Reports',
              tabBarIcon: ({ size, color }) => (
                <BarChart3 size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ size, color }) => (
                <Settings size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </GPSGuard>
    </DashboardProvider>
  );
}
