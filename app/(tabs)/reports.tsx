import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, TrendingUp, Download, Filter, Calendar, MapPin } from 'lucide-react-native';

export default function Reports() {
  const reportData = [
    { title: 'Monthly Survey Report', type: 'PDF', date: '2024-01-15', size: '2.4 MB' },
    { title: 'Location Analysis', type: 'Excel', date: '2024-01-10', size: '1.8 MB' },
    { title: 'Stall Usage Summary', type: 'PDF', date: '2024-01-05', size: '3.2 MB' },
  ];

  const analytics = [
    { label: 'Total Surveys', value: '156', trend: '+12%', color: '#2563EB' },
    { label: 'Completed This Month', value: '45', trend: '+8%', color: '#059669' },
    { label: 'Pending Reviews', value: '12', trend: '-5%', color: '#DC2626' },
    { label: 'Average Time', value: '8 min', trend: '-2%', color: '#7C3AED' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>Survey performance insights</Text>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Calendar size={18} color="#64748b" />
            <Text style={styles.filterText}>Date Range</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <MapPin size={18} color="#64748b" />
            <Text style={styles.filterText}>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color="#64748b" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Cards */}
        <View style={styles.analyticsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {analytics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={[styles.metricTrend, { color: metric.color }]}>
                    {metric.trend}
                  </Text>
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Placeholder */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Survey Trends</Text>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={48} color="#94a3b8" />
            <Text style={styles.chartText}>Chart visualization would appear here</Text>
          </View>
        </View>

        {/* Report Downloads */}
        <View style={styles.reportsContainer}>
          <Text style={styles.sectionTitle}>Available Reports</Text>
          {reportData.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <View style={styles.reportMeta}>
                  <Text style={styles.reportDate}>{report.date}</Text>
                  <Text style={styles.reportSize}>{report.size}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>
          ))}
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
    paddingHorizontal: 20,
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
  analyticsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
  },
  reportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 16,
  },
  reportSize: {
    fontSize: 14,
    color: '#64748b',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
  },
});