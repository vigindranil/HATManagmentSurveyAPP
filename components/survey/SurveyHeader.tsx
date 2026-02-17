import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStyles } from './SurveyStyles';
import { steps } from '../../constant/survey_constant';
import { useTheme } from '@/context/theme-context';

interface SurveyHeaderProps {
    currentStep: number;
}

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({ currentStep }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData.icon;

    return (
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
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentStep + 1) / steps.length) * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </Text>
            </View>
        </LinearGradient>
    );
};
