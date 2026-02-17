import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChartBar as BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  MapPin,
} from 'lucide-react-native';

import { Colors, useTheme } from '@/context/theme-context';

export default function Reports() {
  const { isDarkMode, theme } = useTheme();
  const activeColors = Colors[theme];

  const reportData = [
    {
      title: 'Monthly Survey Report',
      type: 'PDF',
      date: '2024-01-15',
      size: '2.4 MB',
    },
    {
      title: 'Location Analysis',
      type: 'Excel',
      date: '2024-01-10',
      size: '1.8 MB',
    },
    {
      title: 'Stall Usage Summary',
      type: 'PDF',
      date: '2024-01-05',
      size: '3.2 MB',
    },
  ];

  const analytics = [
    { label: 'Total Surveys', value: '156', trend: '+12%', color: '#2563EB' },
    {
      label: 'Completed This Month',
      value: '45',
      trend: '+8%',
      color: '#059669',
    },
    { label: 'Pending Reviews', value: '12', trend: '-5%', color: '#DC2626' },
    { label: 'Average Time', value: '8 min', trend: '-2%', color: '#7C3AED' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: activeColors.header }]}>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>Reports & Analytics</Text>
          <Text style={[styles.headerSubtitle, { color: activeColors.subtext }]}>Survey Performance Insights</Text>
        </View>

        {/* Filter Options */}
        <View style={styles.scrollHorizontalView}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <Calendar size={18} color={activeColors.subtext} />
              <Text style={[styles.filterText, { color: activeColors.subtext }]}>Date Range</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <MapPin size={18} color={activeColors.subtext} />
              <Text style={[styles.filterText, { color: activeColors.subtext }]}>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <Filter size={18} color={activeColors.subtext} />
              <Text style={[styles.filterText, { color: activeColors.subtext }]}>Filter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Coming Soon Section */}
        <View style={styles.comingSoonContainer}>
          <View style={[styles.comingSoonCard, { backgroundColor: activeColors.card }]}>
            <BarChart3 size={64} color={isDarkMode ? '#3b82f6' : '#2563EB'} style={styles.comingSoonIcon} />
            <Text style={[styles.comingSoonTitle, { color: activeColors.text }]}>Analytics Coming Soon</Text>
            <Text style={[styles.comingSoonSubtitle, { color: activeColors.subtext }]}>
              We're working on advanced reporting and data visualization features. Stay tuned!
            </Text>
          </View>
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  scrollHorizontalView: {
    marginRight: 20,
    marginLeft: 20,
  },
  comingSoonContainer: {
    padding: 20,
    marginTop: 20,
  },
  comingSoonCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  comingSoonIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 10,
  },
});
