import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStyles } from './SurveyStyles';
import { steps } from '../../constant/survey_constant';
import { useTheme } from '@/context/theme-context';

interface SurveyFooterProps {
    currentStep: number;
    isSaving: boolean;
    loadingImage: string | null;
    prevStep: () => void;
    nextStep: () => void;
    color: string;
}

export const SurveyFooter: React.FC<SurveyFooterProps> = ({
    currentStep,
    isSaving,
    loadingImage,
    prevStep,
    nextStep,
    color,
}) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    return (
        <View style={styles.buttonContainer}>
            {currentStep > 0 && (
                <TouchableOpacity
                    style={[
                        styles.prevButton,
                        (isSaving || !!loadingImage) && { backgroundColor: '#D1D5DB' }
                    ]}
                    onPress={prevStep}
                    disabled={isSaving || !!loadingImage}
                >
                    <ChevronLeft size={20} color={(isSaving || !!loadingImage) ? "#9CA3AF" : "#6B7280"} />
                    <Text
                        style={[
                            styles.prevButtonText,
                            (isSaving || !!loadingImage) && { color: '#9CA3AF' }
                        ]}
                    >
                        Previous
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={[
                    styles.nextButton,
                    currentStep === 0 && styles.nextButtonFull,
                ]}
                onPress={nextStep}
                disabled={isSaving || !!loadingImage}
            >
                <LinearGradient
                    colors={
                        (isSaving || loadingImage)
                            ? ['#9CA3AF', '#6B7280'] as const
                            : [color, color + 'CC'] as const
                    }
                    style={styles.nextButtonGradient}
                >
                    <Text style={styles.nextButtonText}>
                        {isSaving
                            ? 'Saving...'
                            : loadingImage
                                ? 'Processing...'
                                : currentStep === steps.length - 1
                                    ? 'Submit Survey'
                                    : 'Continue'}
                    </Text>
                    {currentStep < steps.length - 1 && (
                        <ChevronRight size={20} color="#ffffff" />
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};
