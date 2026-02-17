import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { getStyles } from '../SurveyStyles';
import { useTheme, Colors } from '@/context/theme-context';

export const SurveyDateField = ({ field, surveyData, updateField, showPicker, setShowPicker, date }: any) => {
    const { isDarkMode, theme } = useTheme();
    const styles = getStyles(isDarkMode);
    const activeColors = Colors[theme];
    const value = surveyData[field.key] || '';
    const isDisabled = field.key === 'user_id' || field.key === 'citizenship';

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity
                style={[styles.datePickerButton, isDisabled && styles.disabledInputContainer]}
                onPress={() => !isDisabled && setShowPicker(true)}
                disabled={isDisabled}
            >
                <Calendar color={isDisabled ? activeColors.subtext : activeColors.primary} size={20} style={{ marginRight: 10 }} />
                <Text style={[styles.dateButtonText, isDisabled && { color: activeColors.subtext }]}>
                    {value ? new Date(value as string).toLocaleDateString() : 'Select Date'}
                </Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={value ? new Date(value as string) : date}
                    mode="date"
                    display="default"
                    onChange={(e, d) => {
                        setShowPicker(false);
                        if (d) updateField(field.key, d.toISOString().split('T')[0]);
                    }}
                />
            )}
        </View>
    );
};
