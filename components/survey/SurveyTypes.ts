export type ImageFieldType = {
    uri: string;
    name: string;
    type: string;
};

export interface SurveyData {
    licenseType: string;
    applicationStatus: string;
    applicationFor: string;
    usesType: string;
    remarks: string;
    district_id: string;
    police_station_id: string;
    hat_id: string;
    mouza_id: string;
    stall_no: string;
    holding_no: string;
    statusType: string;
    block_or_municipality: string;
    jl_no: string;
    khatian_no: string;
    plot_no: string;
    area_dom_sqft: string;
    area_com_sqft: string;
    direction: string;
    latitude: string;
    longitude: string;
    user_id: string;
    is_within_family: boolean;
    transfer_relationship: string;
    is_same_owner: boolean;
    rented_to_whom: string;
    name: string;
    guardian_name: string;
    address: string;
    mobile: string;
    citizenship: string;
    pin_code: string;
    documentTypes: string;
    documentNumber: string;
    document_image: string;
    pan: string;
    pan_image: string;
    previous_license_no: string;
    license_image: string;
    license_expiry_date: string;
    property_tax_payment_to_year: string;
    land_transfer_explanation: string;
    occupy: boolean;
    occupy_from_year: string;
    present_occupier_name: string;
    block_municipality_id: string;
    ward_id: string;
    occupier_guardian_name: string;
    residential_certificate_attached: string;
    trade_license_attached: string;
    affidavit_attached: string;
    adsr_name: string;
    warision_certificate_attached: string;
    death_certificate_attached: string;
    noc_legal_heirs_attached: string;
    sketch_map_attached: string;
    stall_image1: string;
    stall_image2: string;
    land_valuation_document: string;
    land_valuation_amount: string;
}

export interface AlertInfo {
    visible: boolean;
    type: 'success' | 'error' | 'Permission Denied' | 'Something went Wrong' | 'Survey Failure' | 'Invalid' | 'Missing Information' | 'Unauthorized' | 'Autofill Successful' | 'User Not Found' | 'User Details Unavailable' | 'Invalid Format' | 'Invalid Amount' | 'Amount Too Low';
    message: string;
    context?: 'survey_submission' | 'autofill_success' | 'unauthorized_access' | undefined;
}
