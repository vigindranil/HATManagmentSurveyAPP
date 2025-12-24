import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { styles } from '../SurveyStyles';

export const SurveyDateField = ({ field, surveyData, updateField, showPicker, setShowPicker, date }: any) => {
    const value = surveyData[field.key];
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
                <Calendar color="#6B7280" size={20} style={{ marginRight: 10 }} />
                <Text style={{ color: '#111827', fontSize: 16 }}>{value ? new Date(value as string).toLocaleDateString() : 'Select Date'}</Text>
            </TouchableOpacity>
            {showPicker && <DateTimePicker value={value ? new Date(value as string) : date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if (d) updateField(field.key, d.toISOString().split('T')[0]); }} />}
        </View>
    );
};
