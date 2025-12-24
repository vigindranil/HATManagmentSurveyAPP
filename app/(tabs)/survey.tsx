import React, { useRef } from 'react';
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '@/components/CustomAlert';
import { steps } from '@/constant/survey_constant';

// Sub-components
import { SurveyHeader } from '@/components/survey/SurveyHeader';
import { StepIndicator } from '@/components/survey/StepIndicator';
import { SurveyField } from '@/components/survey/SurveyField';
import { SurveyFooter } from '@/components/survey/SurveyFooter';
import { styles } from '@/components/survey/SurveyStyles';

// Logic Hook
import { useSurveyLogic } from '@/components/survey/useSurveyLogic';

export default function Survey() {
  const scrollViewRef = useRef<ScrollView>(null);
  const logic = useSurveyLogic(scrollViewRef);

  const currentStepData = steps[logic.currentStep];

  // Scroll to top when step changes
  React.useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [logic.currentStep]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {logic.alertInfo.visible && (
          <CustomAlert
            type={logic.alertInfo.type}
            message={logic.alertInfo.message}
            onConfirm={logic.handleAlertConfirm}
          />
        )}

        <SurveyHeader currentStep={logic.currentStep} />
        <StepIndicator currentStep={logic.currentStep} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? "padding" : "padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.formContainer}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'ios' ? 150 : (logic.keyboardVisible ? 40 : 110)
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContent}>
              {currentStepData.fields.map((field: any) => (
                <SurveyField
                  key={field.key}
                  field={field}
                  surveyData={logic.surveyData}
                  updateField={logic.updateField}
                  processImage={logic.processImage}
                  loadingImage={logic.loadingImage}
                  showPicker={logic.showPicker}
                  setShowPicker={logic.setShowPicker}
                  date={logic.date}
                  district={logic.district}
                  policeStationOptions={logic.policeStationOptions}
                  mouzaOptions={logic.mouzaOptions}
                  haatAllDetailsOptions={logic.haatAllDetailsOptions}
                  adsrOptions={logic.adsrOptions}
                  jlNOOptions={logic.jlNOOptions}
                  blockMunicipalityOptions={logic.blockMunicipalityOptions}
                  wardOptions={logic.wardOptions}
                  handleBlockTypeChange={logic.handleBlockTypeChange}
                  handleBlockMunicipalityIdChange={logic.handleBlockMunicipalityIdChange}
                  handleDistrictChange={logic.handleDistrictChange}
                  handlePoliceStationChange={logic.handlePoliceStationChange}
                  mobileAutofillSuccessful={logic.mobileAutofillSuccessful}
                  isPanAutofilled={logic.isPanAutofilled}
                  setIsPanAutofilled={logic.setIsPanAutofilled}
                  setMobileAutofillSuccessful={logic.setMobileAutofillSuccessful}
                  setAlertInfo={logic.setAlertInfo}
                  scrollViewRef={scrollViewRef}
                  isFieldVisible={logic.isFieldVisible}
                />
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SurveyFooter
        currentStep={logic.currentStep}
        isSaving={logic.isSaving}
        loadingImage={logic.loadingImage}
        prevStep={logic.prevStep}
        nextStep={logic.nextStep}
        color={currentStepData.color}
      />
    </View>
  );
}