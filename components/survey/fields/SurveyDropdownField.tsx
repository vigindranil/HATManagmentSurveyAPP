import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { styles } from '../SurveyStyles';
import {
    yesNoOptions, documentTypes, transferRelationshipOptions, licenseType,
    applicationStatus, applicationFor, usesType, statusType, blockOrMunicipalityType
} from '../../../constant/survey_constant';

export const SurveyDropdownField = ({
    field, surveyData, updateField, district, policeStationOptions, mouzaOptions,
    haatAllDetailsOptions, adsrOptions, jlNOOptions, blockMunicipalityOptions,
    wardOptions, handleDistrictChange, handlePoliceStationChange, handleBlockTypeChange,
    handleBlockMunicipalityIdChange
}: any) => {
    const dropdownDataMap: Record<string, any[]> = {
        licenseType, applicationStatus, applicationFor, usesType, documentTypes, statusType,
        block_or_municipality: blockOrMunicipalityType,
        transfer_relationship: transferRelationshipOptions,
    };

    const isApiDropdown = ['district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', 'block_municipality_id', 'ward_id'].includes(field.key);
    let data = dropdownDataMap[field.key] || yesNoOptions;
    let isDisabled = false;
    let disabledPlaceholder = field.placeholder;
    let lockedLabel = null;
    let onSelect = (val: any) => {
        let v = typeof val === 'object' && 'key' in val ? val.key : val;
        updateField(field.key, v === 'true' ? true : v === 'false' ? false : String(v));
    };

    if (isApiDropdown) {
        if (field.key === 'district_id') {
            data = district; isDisabled = true; onSelect = handleDistrictChange;
        } else if (field.key === 'police_station_id') {
            data = policeStationOptions; onSelect = handlePoliceStationChange;
            if (!surveyData.district_id) { isDisabled = true; disabledPlaceholder = "Select District first"; }
        } else if (field.key === 'block_municipality_id') {
            data = blockMunicipalityOptions; onSelect = handleBlockMunicipalityIdChange;
        } else if (field.key === 'ward_id') {
            data = wardOptions;
            if (!surveyData.block_municipality_id) {
                isDisabled = true;
                disabledPlaceholder = `Select ${surveyData.block_or_municipality === '1' ? "Block" : "Municipality"} first`;
            }
        } else if (field.key === 'hat_id') {
            data = haatAllDetailsOptions;
            if (!surveyData.district_id) { isDisabled = true; disabledPlaceholder = "Select District first"; }
        } else {
            data = field.key === 'mouza_id' ? mouzaOptions : (field.key === 'adsr_name' ? adsrOptions : jlNOOptions);
            if (!surveyData.police_station_id) { isDisabled = true; disabledPlaceholder = "Select Police Station first"; }
        }
    } else {
        if (field.key === 'usesType' && surveyData.licenseType === '2') lockedLabel = 'Commercial';
        if (field.key === 'applicationFor' && ['1', '2'].includes(surveyData.applicationStatus || '')) lockedLabel = 'Self';
        if (field.key === 'block_or_municipality') {
            onSelect = handleBlockTypeChange;
            if (!surveyData.district_id) { isDisabled = true; disabledPlaceholder = "Select District first"; }
        }
    }

    const value = surveyData[field.key];
    let defaultOptionObj = undefined;
    if (value !== null && value !== undefined) {
        const found = data.find(i => String(i.key) === String(value));
        if (found) {
            defaultOptionObj = { key: String(value), value: found.value };
            if (isDisabled) lockedLabel = found.value;
        }
    }

    // Construct a key that depends only on parent dependencies, not the value itself.
    // This allows the close animation to play (no unmount on select) while ensuring resets work.
    let dependencyKey = '';
    if (['police_station_id', 'hat_id', 'block_or_municipality'].includes(field.key)) {
        dependencyKey = String(surveyData.district_id || '');
    } else if (['mouza_id', 'adsr_name', 'jl_no'].includes(field.key)) {
        dependencyKey = String(surveyData.police_station_id || '');
    } else if (field.key === 'block_municipality_id') {
        dependencyKey = `${surveyData.district_id || ''}-${surveyData.block_or_municipality || ''}`;
    } else if (field.key === 'ward_id') {
        dependencyKey = String(surveyData.block_municipality_id || '');
    }

    const selectKey = `${field.key}-${dependencyKey}`;

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label} {field.required && <Text style={styles.required}>*</Text>}</Text>
            <View style={[styles.inputContainer, isDisabled && { backgroundColor: '#F3F4F6' }]}>
                {lockedLabel ? (
                    <TextInput style={[styles.textInput, { color: '#6B7280', backgroundColor: '#F5F5F5', borderRadius: 10 }]} value={lockedLabel} editable={false} />
                ) : isDisabled ? (
                    <View style={{ padding: 16 }}><Text style={{ color: '#9CA3AF', fontSize: 16 }}>{disabledPlaceholder}</Text></View>
                ) : (
                    <SelectList
                        key={selectKey}
                        setSelected={(val: any) => {
                            onSelect(val);
                            if (field.key === 'documentTypes') { updateField('document_image', null); updateField('documentNumber', null); }
                            if (field.key === 'licenseType') updateField('usesType', val === '2' ? '1' : '');
                            if (field.key === 'applicationStatus') updateField('applicationFor', (val === '1' || val === '2') ? '1' : '');
                        }}
                        data={data} save="key" search={isApiDropdown} placeholder={field.placeholder} defaultOption={defaultOptionObj}
                        boxStyles={{ borderWidth: 0, paddingHorizontal: 16, paddingVertical: 14 }}
                        dropdownStyles={{ borderWidth: 0 }}
                        dropdownTextStyles={{ fontWeight: 'bold', color: '#111827', fontSize: 16 }}
                        dropdownItemStyles={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10, marginHorizontal: 10 }}
                        inputStyles={{ color: '#000000', fontSize: 16 }}
                    />
                )}
            </View>
        </View>
    );
};
