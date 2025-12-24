import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { XCircle } from 'lucide-react-native';
import { styles } from '../SurveyStyles';
import { ImageFieldType } from '../SurveyTypes';

export const SurveyImageField = ({ field, surveyData, updateField, processImage, loadingImage }: any) => {
    const value = surveyData[field.key] as unknown as ImageFieldType;
    const isMulti = field.type === 'images';

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={() => processImage(field.key, isMulti)}>
                {loadingImage === field.key ? <ActivityIndicator size="large" color="#2563EB" />
                    : value?.uri ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: value.uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImageButton} onPress={() => updateField(field.key, null)}><XCircle size={28} color="#DC2626" fill="#ffffff" /></TouchableOpacity>
                        </View>)
                        : <Text style={styles.imagePickerText}>{field.placeholder}</Text>}
            </TouchableOpacity>
        </View>
    );
};
