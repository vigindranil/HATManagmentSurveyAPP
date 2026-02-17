import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Camera, X, ImageIcon, XCircle } from 'lucide-react-native';
import { getStyles } from '../SurveyStyles';
import { ImageFieldType } from '../SurveyTypes';
import { useTheme, Colors } from '@/context/theme-context';

export const SurveyImageField = ({ field, surveyData, updateField, processImage, loadingImage, setShowPicker }: any) => {
    const { isDarkMode, theme } = useTheme();
    const styles = getStyles(isDarkMode);
    const activeColors = Colors[theme];
    const value = surveyData[field.key] as unknown as ImageFieldType;
    const isMulti = field.type === 'images';
    const isDisabled = false; // Default for now, can be updated if logic changes

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity
                style={[styles.imagePickerButton, isDisabled && styles.disabledInputContainer]}
                onPress={() => !isDisabled && processImage(field.key, isMulti)}
                disabled={isDisabled || loadingImage === field.key}
            >
                {loadingImage === field.key ? <ActivityIndicator size="large" color={activeColors.primary} />
                    : value?.uri ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: value.uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImageButton} onPress={() => !isDisabled && updateField(field.key, null)} disabled={isDisabled}>
                                <XCircle size={28} color="#DC2626" fill={activeColors.card} />
                            </TouchableOpacity>
                        </View>)
                        : <Text style={styles.imagePickerText}>{field.placeholder}</Text>}
            </TouchableOpacity>
        </View>
    );
};
