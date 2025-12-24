import { SurveyData } from '../SurveyTypes';

export const STATUS_MAP: Record<string, string> = { '1': 'new', '2': 'existing', '3': 'transfer' };

export const isFieldVisible = (field: any, data: Partial<SurveyData>) => {
    const currentStatusString = STATUS_MAP[data.applicationStatus as string];

    // 1. Basic dependency checks
    if (field.key === 'holding_no' && data.licenseType !== '1') return false;
    if (field.key === 'stall_no' && data.licenseType !== '2') return false;
    if (['user_id', 'latitude', 'longitude'].includes(field.key)) return false;
    if (field.showFor && !field.showFor.includes(currentStatusString)) return false;

    // 2. Complex dependency checks (dependsOn)
    if (field.dependsOn) {
        const val = data[field.dependsOn.key as keyof SurveyData];
        if (val !== field.dependsOn.value) return false;
    }

    // 3. Document/Location specific visibility
    if ((field.key === 'document_image' || field.key === 'documentNumber') && !data.documentTypes) return false;
    if (field.key === 'block_municipality_id' && !data.block_or_municipality) return false;
    if (field.key === 'ward_id' && !data.block_or_municipality) return false;

    // 4. Transfer Step specific hidden fields
    if (currentStatusString === 'transfer' && ['previous_license_no', 'license_expiry_date', 'property_tax_payment_to_year', 'license_image'].includes(field.key)) {
        return false;
    }

    return true;
};

export const getCleanedDataBeforeStepChange = (newData: Partial<SurveyData>, oldStatus: string | null) => {
    const data = { ...newData };
    const currentStatus = data.applicationStatus;
    const currentType = data.licenseType;

    // Type cleanup
    if (currentType === '1') delete data.stall_no;
    if (currentType === '2') delete data.holding_no;

    // Status logic (New/Existing/Transfer)
    const transferOnlyFields: (keyof SurveyData)[] = [
        'is_within_family', 'transfer_relationship', 'land_transfer_explanation',
        'occupy', 'occupy_from_year', 'present_occupier_name', 'occupier_guardian_name',
        'affidavit_attached', 'warision_certificate_attached', 'death_certificate_attached', 'noc_legal_heirs_attached'
    ];
    const sharedFields: (keyof SurveyData)[] = ['previous_license_no', 'license_expiry_date', 'property_tax_payment_to_year', 'license_image'];

    if (currentStatus !== oldStatus) {
        if (currentStatus === '1') {
            transferOnlyFields.forEach(k => delete data[k]);
            sharedFields.forEach(k => delete data[k]);
        } else {
            sharedFields.forEach(k => delete data[k]);
            if (currentStatus !== '3') transferOnlyFields.forEach(k => delete data[k]);
        }
    }

    // Independent dependency cleanup
    if (data.is_within_family === false) delete data.transfer_relationship;
    if (data.occupy === false) {
        delete data.occupy_from_year;
        delete data.present_occupier_name;
        delete data.occupier_guardian_name;
    }

    return data;
};

export const validateField = (field: any, val: string, surveyData: Partial<SurveyData>) => {
    if (field.required && !val) {
        return { valid: false, type: 'Missing Information', message: `${field.label} is required` };
    }

    if (val) {
        if (field.key === 'pin_code' && !/^[0-9]{6}$/.test(val))
            return { valid: false, type: 'Invalid Format', message: 'Invalid PIN code (6 digits)' };

        if (field.key === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val))
            return { valid: false, type: 'Invalid Format', message: 'Invalid PAN format.\nExample: ABCDE1234F' };

        if (field.key === 'mobile' && !/^[6-9]\d{9}$/.test(val))
            return { valid: false, type: 'Invalid Format', message: 'Invalid 10-digit mobile number' };

        if (field.key === 'documentNumber') {
            if (surveyData.documentTypes === '1' && !/^[0-9]{12}$/.test(val))
                return { valid: false, type: 'Invalid Format', message: 'Aadhar must be 12 digits' };
            if (surveyData.documentTypes === '2' && val.length < 10)
                return { valid: false, type: 'Invalid Format', message: 'Invalid Voter ID' };
        }

        if (field.key === 'land_valuation_amount') {
            const amt = parseFloat(val);
            if (isNaN(amt)) return { valid: false, type: 'Invalid Amount', message: 'Enter a numeric value' };
            if (amt < 1000) return { valid: false, type: 'Amount Too Low', message: 'Minimum ₹1,000 required' };
        }
    }

    return { valid: true };
};
