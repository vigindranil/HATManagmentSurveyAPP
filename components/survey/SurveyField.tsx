import React from 'react';
import { SurveyInputField } from './fields/SurveyInputField';
import { SurveyDropdownField } from './fields/SurveyDropdownField';
import { SurveyImageField } from './fields/SurveyImageField';
import { SurveyDateField } from './fields/SurveyDateField';
import { documentTypes } from '../../constant/survey_constant';

interface SurveyFieldProps {
    field: any;
    surveyData: any;
    updateField: any;
    processImage: any;
    loadingImage: any;
    showPicker: any;
    setShowPicker: any;
    date: any;
    district: any;
    policeStationOptions: any;
    mouzaOptions: any;
    haatAllDetailsOptions: any;
    adsrOptions: any;
    jlNOOptions: any;
    blockMunicipalityOptions: any;
    wardOptions: any;
    handleBlockTypeChange: any;
    handleBlockMunicipalityIdChange: any;
    handleDistrictChange: any;
    handlePoliceStationChange: any;
    mobileAutofillSuccessful: any;
    isPanAutofilled: any;
    setIsPanAutofilled: any;
    setMobileAutofillSuccessful: any;
    setAlertInfo: any;
    scrollViewRef: any;
    isFieldVisible: (field: any, data: any) => boolean;
}

export const SurveyField: React.FC<SurveyFieldProps> = (props) => {
    const { field, surveyData, isFieldVisible } = props;

    if (!isFieldVisible(field, surveyData)) return null;

    // Enhance field label dynamically based on context
    const enhancedField = { ...field };
    if (field.key === 'block_municipality_id') {
        enhancedField.label = surveyData.block_or_municipality === '1' ? "Block Name" : "Municipality Name";
    } else if (field.key === 'ward_id') {
        enhancedField.label = surveyData.block_or_municipality === '1' ? "Gram Panchayat" : "Ward No";
    } else if ((field.key === 'document_image' || field.key === 'documentNumber') && surveyData.documentTypes) {
        const doc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
        if (doc) enhancedField.label = `${doc.value}${field.key === 'document_image' ? ' Image' : ' Number'}`;
    }

    // Route to specific field type component
    if (field.type === 'image' || field.type === 'images') {
        return <SurveyImageField {...props} field={enhancedField} />;
    }

    if (field.type === 'date') {
        return <SurveyDateField {...props} field={enhancedField} />;
    }

    const isDropdown = field.type === 'dropdown' ||
        ['licenseType', 'applicationStatus', 'applicationFor', 'usesType', 'documentTypes', 'statusType', 'block_or_municipality', 'transfer_relationship', 'district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', 'block_municipality_id', 'ward_id'].includes(field.key);

    if (isDropdown) {
        return <SurveyDropdownField {...props} field={enhancedField} />;
    }

    return <SurveyInputField {...props} field={enhancedField} />;
};
