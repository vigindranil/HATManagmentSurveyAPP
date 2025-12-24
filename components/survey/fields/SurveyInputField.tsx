import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../SurveyStyles';
import { numericFields, getMaxLength } from '../../../constant/survey_constant';
import { getUserDetailsByPhoneNumber } from '@/api';

export const SurveyInputField = ({
    field, surveyData, updateField, mobileAutofillSuccessful, isPanAutofilled,
    setMobileAutofillSuccessful, setIsPanAutofilled, setAlertInfo, scrollViewRef
}: any) => {
    const isEditable = field.key !== 'user_id' && field.key !== 'citizenship';
    const autoFields = ['name', 'guardian_name', 'address', 'pin_code'];
    const panField = ['pan'];

    // Logic:
    // 1. Initially (no mobile entered): Auto fields are DISABLED.
    // 2. Mobile entered (10 digits) -> Search Success: Auto fields DISABLED (autofilled).
    // 3. Mobile entered (10 digits) -> Search Failed: Auto fields EDITABLE (manual entry).
    // PAN has existing specific logic (isPanAutofilled), merging it effectively.

    let isDisabled = !isEditable;

    if (autoFields.includes(field.key)) {
        // Disabled if mobile autofill succeeded OR if mobile input is not yet complete/verified (i.e., not failed).
        // Basically, only strictly EDITABLE if we TRIED to search and FAILED (explicit manual mode).
        // BUT wait, 'mobileAutofillSuccessful' being FALSE creates ambiguity between "Not yet searched" and "Searched & Failed".
        // Current 'mobileAutofillSuccessful' is false initially.
        // We need to know if the user HAS entered a valid 10 digit number but no user was found.

        // Actually, simpler usage strictly based on request:
        // "keep the field disabled at first" -> i.e., mobile length < 10.
        // "if details found -> put details and keep disabled"
        // "if not found -> make editable"

        const mobileVal = surveyData['mobile'] || '';
        const isMobileValid = mobileVal.length === 10;

        if (!isMobileValid) {
            isDisabled = true; // Disabled strictly if mobile is invalid/empty
        } else {
            // Mobile IS valid (10 digits).
            // If found (successful), keep disabled.
            // If NOT found (failed), enable.
            isDisabled = mobileAutofillSuccessful;
        }
    }

    if (field.key === 'pan') {
        isDisabled = isPanAutofilled;
        // Special check for PAN: If it was NOT autofilled, it should follow the same "only enable if mobile is valid" rule? 
        // The user request likely groups PAN with the other details.
        if (!isPanAutofilled) {
            const mobileVal = surveyData['mobile'] || '';
            if (mobileVal.length !== 10) isDisabled = true;
        }
    }
    const isNumeric = numericFields.includes(field.key) || (field.key === 'documentNumber' && surveyData.documentTypes === '1');
    const value = surveyData[field.key] || '';

    return (
        <View style={styles.fieldContainer} onLayout={(e) => { (field as any)._y = e.nativeEvent.layout.y; }}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <View style={[styles.inputContainer, isDisabled && { backgroundColor: '#F3F4F6' }]}>
                <TextInput
                    style={[styles.textInput, field.multiline && styles.textInputMultiline]}
                    value={String(value)} placeholder={field.placeholder} editable={!isDisabled}
                    placeholderTextColor="#9CA3AF" keyboardType={isNumeric ? 'numeric' : 'default'}
                    maxLength={getMaxLength(field.key) || (field.key === 'documentNumber' ? (surveyData.documentTypes === '1' ? 12 : 20) : undefined)}
                    autoCapitalize={field.key === 'pan' ? 'characters' : 'sentences'}
                    multiline={field.multiline} numberOfLines={field.multiline ? 4 : 1}
                    onFocus={() => { if ((field as any)._y) scrollViewRef.current?.scrollTo({ y: (field as any)._y - 100, animated: true }); }}
                    onChangeText={(text) => {
                        updateField(field.key, text);
                        if (field.key === 'mobile' && text.length === 10) {
                            getUserDetailsByPhoneNumber(text).then(res => {
                                if (res?.data && res?.status === 0) {
                                    setMobileAutofillSuccessful(true);
                                    updateField('name', res.data.shop_owner_name || '');
                                    updateField('guardian_name', res.data.guardian_name || '');
                                    updateField('address', res.data.address || '');
                                    updateField('pin_code', res.data.pin_code || '');
                                    if (res.data.pan_number) { updateField('pan', res.data.pan_number); setIsPanAutofilled(true); }
                                    setAlertInfo({ visible: true, type: 'Autofill Successful', message: 'User details autofilled!', context: 'autofill_success' });
                                } else {
                                    setMobileAutofillSuccessful(false); setIsPanAutofilled(false);
                                    autoFields.forEach(k => updateField(k, ''));
                                    setAlertInfo({ visible: true, type: 'User Not Found', message: 'No existing user found.' });
                                }
                            }).catch(() => { setMobileAutofillSuccessful(false); autoFields.forEach(k => updateField(k, '')); });
                        } else if (field.key === 'mobile' && text.length < 10) {
                            setMobileAutofillSuccessful(false); setIsPanAutofilled(false);
                            [...autoFields, 'pan'].forEach(k => updateField(k, ''));
                        }
                    }}
                />
            </View>
        </View>
    );
};
