import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, MapPin, Building, User, FileText, Phone, MessageSquare, CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const { width } = Dimensions.get('window');

interface SurveyData {
  // Location Details
  district: string;
  subDivision: string;
  block: string;
  gramPanchayat: string;
  village: string;
  latitude: string;
  longitude: string;
  
  // Shop/Stall Details
  slNo: string;
  registerNo: string;
  stallNo: string;
  presentRent: string;
  shopType: string;
  mode: string;
  natureOfUser: string;
  residential: string;
  commercial: string;
  vacant: string;
  totalArea: string;
  typeOfStructure: string;
  
  // Possession Details
  possessionName: string;
  fatherHusbandName: string;
  possessionReceived: string;
  lr: string;
  rs: string;
  khatianNo: string;
  
  // License & Plan Information
  buildingPlanApproved: string;
  licenseIssued: string;
  pendingIssues: string;
  
  // Contact & Identity Information
  aadharA: string;
  aadharB: string;
  mobileA: string;
  mobileB: string;
  
  // Remarks
  remarks: string;
}

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    district: '', subDivision: '', block: '', gramPanchayat: '', village: '',
    latitude: '', longitude: '', slNo: '', registerNo: '', stallNo: '',
    presentRent: '', shopType: '', mode: '', natureOfUser: '', residential: '',
    commercial: '', vacant: '', totalArea: '', typeOfStructure: '',
    possessionName: '', fatherHusbandName: '', possessionReceived: '',
    lr: '', rs: '', khatianNo: '', buildingPlanApproved: '',
    licenseIssued: '', pendingIssues: '', aadharA: '', aadharB: '',
    mobileA: '', mobileB: '', remarks: ''
  });
  const { saveSurveyOffline, isOnline } = useOfflineStorage();
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    {
      title: 'Location Details',
      icon: MapPin,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      description: 'Geographic information',
      fields: [
        { key: 'district', label: 'District', required: true, placeholder: 'Enter district name' },
        { key: 'subDivision', label: 'Sub-Division', required: true, placeholder: 'Enter sub-division' },
        { key: 'block', label: 'Block', required: true, placeholder: 'Enter block name' },
        { key: 'gramPanchayat', label: 'Gram Panchayat (GP)', required: true, placeholder: 'Enter GP name' },
        { key: 'village', label: 'Village', required: true, placeholder: 'Enter village name' },
        { key: 'latitude', label: 'Latitude', required: false, placeholder: 'Enter latitude (optional)' },
        { key: 'longitude', label: 'Longitude', required: false, placeholder: 'Enter longitude (optional)' },
      ]
    },
    {
      title: 'Shop/Stall Details',
      icon: Building,
      color: '#0891B2',
      bgColor: '#F0FDFA',
      description: 'Property information',
      fields: [
        { key: 'slNo', label: 'Sl. No', required: true, placeholder: 'Enter serial number' },
        { key: 'registerNo', label: 'Register No', required: true, placeholder: 'Enter register number' },
        { key: 'stallNo', label: 'Stall No / Holding No', required: true, placeholder: 'Enter stall/holding number' },
        { key: 'presentRent', label: 'Present Rent', required: true, placeholder: 'Enter current rent amount' },
        { key: 'shopType', label: 'Shop Type', required: true, placeholder: 'Rent / Licensed' },
        { key: 'mode', label: 'Mode', required: true, placeholder: 'Residential / Commercial' },
        { key: 'natureOfUser', label: 'Nature of User', required: true, placeholder: 'S = Self, R = Rented' },
        { key: 'residential', label: 'Residential', required: false, placeholder: 'Residential details' },
        { key: 'commercial', label: 'Commercial', required: false, placeholder: 'Commercial details' },
        { key: 'vacant', label: 'Vacant', required: false, placeholder: 'Vacant area details' },
        { key: 'totalArea', label: 'Total Area', required: true, placeholder: 'Enter total area' },
        { key: 'typeOfStructure', label: 'Type of Structure', required: true, placeholder: 'Enter structure type' },
      ]
    },
    {
      title: 'Possession Details',
      icon: User,
      color: '#059669',
      bgColor: '#F0FDF4',
      description: 'Owner information',
      fields: [
        { key: 'possessionName', label: 'Name of Person in Possession', required: true, placeholder: 'Enter full name' },
        { key: 'fatherHusbandName', label: 'Father\'s / Husband\'s Name', required: true, placeholder: 'Enter father/husband name' },
        { key: 'possessionReceived', label: 'From Whom & When Received', required: true, placeholder: 'Enter possession details' },
        { key: 'lr', label: 'LR', required: false, placeholder: 'Enter LR details' },
        { key: 'rs', label: 'RS', required: false, placeholder: 'Enter RS details' },
        { key: 'khatianNo', label: 'Khatian No', required: false, placeholder: 'Enter Khatian number' },
      ]
    },
    {
      title: 'License & Plan Info',
      icon: FileText,
      color: '#7C3AED',
      bgColor: '#FAF5FF',
      description: 'Legal documentation',
      fields: [
        { key: 'buildingPlanApproved', label: 'Building Plan Approved by JZP', required: true, placeholder: 'Y/N' },
        { key: 'licenseIssued', label: 'License Issued', required: true, placeholder: 'Sl. No and expiry date' },
        { key: 'pendingIssues', label: 'Pending Issues', required: false, placeholder: 'T/N/Renewal/K' },
      ]
    },
    {
      title: 'Contact & Identity',
      icon: Phone,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      description: 'Contact information',
      fields: [
        { key: 'aadharA', label: 'Aadhar No (A)', required: true, placeholder: 'Enter primary Aadhar number' },
        { key: 'aadharB', label: 'Aadhar No (B)', required: false, placeholder: 'Enter secondary Aadhar (optional)' },
        { key: 'mobileA', label: 'Mobile No (A)', required: true, placeholder: 'Enter primary mobile number' },
        { key: 'mobileB', label: 'Mobile No (B)', required: false, placeholder: 'Enter secondary mobile (optional)' },
      ]
    },
    {
      title: 'Remarks',
      icon: MessageSquare,
      color: '#EA580C',
      bgColor: '#FFF7ED',
      description: 'Additional notes',
      fields: [
        { key: 'remarks', label: 'Remarks', required: false, placeholder: 'Enter any additional remarks or notes', multiline: true },
      ]
    }
  ];

  const updateField = (key: string, value: string) => {
    setSurveyData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = () => {
    const currentStepData = steps[currentStep];
    const requiredFields = currentStepData.fields.filter(field => field.required);
    
    for (const field of requiredFields) {
      if (!surveyData[field.key as keyof SurveyData]) {
        Alert.alert('Validation Error', `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const nextStep = async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Save survey offline
        setIsSaving(true);
        try {
          await saveSurveyOffline({ data: surveyData });
          
          const message = isOnline 
            ? 'Survey saved and will be synced automatically!'
            : 'Survey saved offline. It will sync when internet is available.';
          
          Alert.alert('Success', message, [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setSurveyData({
                  district: '', subDivision: '', block: '', gramPanchayat: '', village: '',
                  latitude: '', longitude: '', slNo: '', registerNo: '', stallNo: '',
                  presentRent: '', shopType: '', mode: '', natureOfUser: '', residential: '',
                  commercial: '', vacant: '', totalArea: '', typeOfStructure: '',
                  possessionName: '', fatherHusbandName: '', possessionReceived: '',
                  lr: '', rs: '', khatianNo: '', buildingPlanApproved: '',
                  licenseIssued: '', pendingIssues: '', aadharA: '', aadharB: '',
                  mobileA: '', mobileB: '', remarks: ''
                });
                setCurrentStep(0);
              }
            }
          ]);
        } catch (error) {
          Alert.alert('Error', 'Failed to save survey. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;
          
          return (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isCompleted && styles.stepCompleted,
                isCurrent && [styles.stepCurrent, { backgroundColor: step.color }]
              ]}>
                {isCompleted ? (
                  <CheckCircle size={16} color="#ffffff" />
                ) : (
                  <StepIcon size={16} color={isCurrent ? "#ffffff" : "#9CA3AF"} />
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderField = (field: any) => {
    return (
      <View key={field.key} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label} {field.required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, field.multiline && styles.textInputMultiline]}
            value={surveyData[field.key as keyof SurveyData]}
            onChangeText={(value) => updateField(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
          />
        </View>
      </View>
    );
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <LinearGradient
        colors={[currentStepData.color, currentStepData.color + '90']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: currentStepData.bgColor }]}>
              <StepIcon size={24} color={currentStepData.color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{currentStepData.title}</Text>
              <Text style={styles.headerSubtitle}>{currentStepData.description}</Text>
            </View>
          </View>
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>{currentStep + 1}/{steps.length}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </Text>
        </View>
      </LinearGradient>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        {renderStepIndicator()}
      </View>

      {/* Form Content */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          {currentStepData.fields.map(renderField)}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
            <ChevronLeft size={20} color="#6B7280" />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]} 
          onPress={nextStep}
          disabled={isSaving}
        >
          <LinearGradient
            colors={isSaving ? ['#9CA3AF', '#6B7280'] : [currentStepData.color, currentStepData.color + 'CC']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isSaving ? 'Saving...' : (currentStep === steps.length - 1 ? 'Submit Survey' : 'Continue')}
            </Text>
            {currentStep < steps.length - 1 && (
              <ChevronRight size={20} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  stepCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepCounterText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#059669',
  },
  stepCurrent: {
    // backgroundColor set dynamically
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
  },
  textInputMultiline: {
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  prevButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
});