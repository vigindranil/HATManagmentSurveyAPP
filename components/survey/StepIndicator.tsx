import React from 'react';
import { View } from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { styles } from './SurveyStyles';
import { steps } from '../../constant/survey_constant';

interface StepIndicatorProps {
    currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    return (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const StepIcon = step.icon;
                    return (
                        <View key={index} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    isCompleted && styles.stepCompleted,
                                    isCurrent && [styles.stepCurrent, { backgroundColor: step.color }],
                                ]}
                            >
                                {isCompleted ? (
                                    <CheckCircle size={16} color="#ffffff" />
                                ) : (
                                    <StepIcon size={16} color={isCurrent ? '#ffffff' : '#9CA3AF'} />
                                )}
                            </View>
                            {index < steps.length - 1 && (
                                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
