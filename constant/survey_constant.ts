 import { User, FileText, Building, MessageSquare } from 'lucide-react-native';

export const yesNoOptions = [
  { key: 'true', value: 'Yes' },
  { key: 'false', value: 'No' },
];

export const documentTypes = [
  { key: '1', value: 'Aadhar' },
  { key: '2', value: 'Voter ID' },
];

export const transferRelationshipOptions = [
  { key: '3', value: 'Son' },
  { key: '5', value: 'Mother' },
  { key: '4', value: 'Father' },
  { key: '1', value: 'Wife' },
  { key: '2', value: 'Daughter' },
  { key: '6', value: 'Others' },
];

export const steps = [
  {
    title: 'Application Metadata',
    icon: User,
    color: '#059669',
    bgColor: '#F0FDF4',
    description: 'Owner information',
    fields: [
      {
        key: 'licenseType',
        label: 'License Type',
        required: true,
        placeholder: 'Select license type',
      },
      {
        key: 'applicationStatus',
        label: 'Application Status',
        required: true,
        placeholder: 'Select Application Status',
      },
      {
        key: 'applicationFor',
        label: 'Application For',
        required: true,
        placeholder: 'Select Application For',
      },
      {
        key: 'usesType',
        label: 'Usage Type',
        required: true,
        placeholder: 'Select Uses Type',
      },
    ],
  },
  {
    title: 'Applicant Details',
    icon: FileText,
    color: '#A33BB8',
    bgColor: '#FFF7ED',
    description: 'Applicant personal and document information',
    fields: [
      {
        key: 'mobile',
        label: 'Mobile Number',
        required: true,
        placeholder: 'Enter mobile number',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'name',
        label: 'Name',
        required: true,
        placeholder: 'Enter applicant name',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'guardian_name',
        label: "Guardian's Name",
        required: true,
        placeholder: "Enter father's/husband's name",
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'address',
        label: 'Address',
        required: true,
        placeholder: 'Enter address',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'citizenship',
        label: 'Citizenship',
        required: true,
        placeholder: 'Enter citizenship',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'statusType',
        label: 'Status Type',
        required: true,
        placeholder: 'Enter status type',
        showFor: ['new', 'existing', 'transfer'],
        
      },
      {
        key: 'pin_code',
        label: 'Pin Code',
        required: true,
        placeholder: 'Enter pin code',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'documentTypes',
        label: 'Document Type',
        required: true,
        placeholder: 'Select document type',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'documentNumber',
        label: 'Document Number',
        required: true,
        placeholder: 'Enter document number',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'document_image',
        label: `Document Image`,
        required: false,
        placeholder: 'Upload document image',
        showFor: ['new', 'existing', 'transfer'],
        type: 'image',
      },
      {
        key: 'pan',
        label: 'PAN',
        required: true,
        placeholder: 'Enter PAN number',
        showFor: ['new', 'existing', 'transfer'],
      },
      {
        key: 'pan_image',
        label: 'PAN Image',
        required: false,
        placeholder: 'Upload PAN image',
        showFor: ['new', 'existing', 'transfer'],
        type: 'image',
      },
      {
        key: 'residential_certificate_attached',
        label: 'Residential Certificate (Attachment)',
        required: false,
        placeholder: 'Upload residential certificate',
        showFor: ['new', 'existing', 'transfer'],
        type: 'image',
      },
      {
        key: 'trade_license_attached',
        label: 'Trade License (Attachment)',
        required: false,
        placeholder: 'Upload trade license',
        showFor: ['new', 'existing', 'transfer'],
        type: 'image',
      },
      {
        key: 'previous_license_no',
        label: 'Previous License No',
        required: true,
        placeholder: 'Enter previous license number ',
        showFor: ['existing', 'transfer'],
      },
      {
        key: 'license_image',
        label: 'License Image',
        required: false,
        placeholder: 'Upload license image',
        showFor: ['existing', 'transfer'],
        type: 'image',
      },
      {
        key: 'license_expiry_date',
        label: 'License Expiry Date',
        required: true,
        placeholder: 'Select license expiry date ',
        showFor: ['existing', 'transfer'],
        type: 'date',
      },
      {
        key: 'property_tax_payment_to_year',
        label: 'Fees and Rent Up To Year',
        required: true,
        placeholder: 'Enter year up to which property tax is paid ',
        showFor: ['existing', 'transfer'],
      },
      {
        key: 'is_within_family',
        label: 'Is Within Family',
        required: true,
        placeholder: 'Is the transfer within family?',
        showFor: ['transfer'],
        type: 'dropdown',
      },
      {
        key: 'transfer_relationship',
        label: 'Transfer Relationship',
        required: true,
        placeholder: 'Select relationship',
        showFor: ['transfer'],
        type: 'dropdown',
        dependsOn: { key: 'is_within_family', value: true },
      },
      {
        key: 'land_transfer_explanation',
        label: 'Land Transfer Explanation',
        required: true,
        placeholder: 'Explain land transfer ',
        multiline: true, // Mark as multiline
        showFor: ['transfer'],
      },
      {
        key: 'occupy',
        label: 'Is property occupied?',
        required: true,
        placeholder: 'Select an option',
        showFor: ['transfer'],
        type: 'dropdown',
      },
      {
        key: 'occupy_from_year',
        label: 'Occupy From Year',
        required: true,
        placeholder: 'Enter year of occupation ',
        showFor: ['transfer'],
        dependsOn: { key: 'occupy', value: true },
      },
      {
        key: 'present_occupier_name',
        label: 'Present Occupier Name',
        required: true,
        placeholder: 'Enter present occupier name',
        showFor: ['transfer'],
        dependsOn: { key: 'occupy', value: true },
      },
      {
        key: 'occupier_guardian_name',
        label: "Occupier's Guardian Name",
        required: true,
        placeholder: "Enter occupier's guardian name ",
        showFor: ['transfer'],
        dependsOn: { key: 'occupy', value: true },
      },
      {
        key: 'affidavit_attached',
        label: 'Affidavit (Attachment)',
        required: false,
        placeholder: 'Upload affidavit',
        showFor: ['transfer'],
        type: 'image',
      },
      {
        key: 'fees_and_rent_up_to_year',
        label: 'Fees and Rent Up To Year(Attachment)',
        required: false,
        placeholder: 'Upload fees and rent up to year',
        showFor: ['existing'],
        type: 'image',
      },
      {
        key: 'warision_certificate_attached',
        label: 'Warision Certificate (Attachment)',
        required: false,
        placeholder: 'Upload warision certificate ',
        showFor: ['transfer'],
        type: 'image',
      },
      {
        key: 'death_certificate_attached',
        label: 'Death Certificate (Attachment)',
        required: false,
        placeholder: 'Upload death certificate ',
        showFor: ['transfer'],
        type: 'image',
      },
      {
        key: 'noc_legal_heirs_attached',
        label: 'NOC Legal Heirs (Attachment)',
        required: false,
        placeholder: 'Upload NOC from legal heirs',
        showFor: ['transfer'],
        type: 'image',
      },
    ],
  },
  {
    title: 'Plot Details',
    icon: Building,
    color: '#0891B2',
    bgColor: '#F0FDFA',
    description: 'Property information',
    fields: [
      {
        key: 'district_id',
        label: 'District',
        required: true,
        placeholder: 'Select district',
      },
      {
        key: 'block_municipality_id',
        label: 'Block/Municipality',
        required: true,
        placeholder: 'Select block/municipality',
      },
      {
        key: 'ward_id',
        label: 'GP/Ward',
        required: true,
        placeholder: 'Select GP/ward',
      },
      {
        key: 'police_station_id',
        label: 'Police Station',
        required: true,
        placeholder: 'Select police station',
      },
      {
        key: 'hat_id',
        label: 'Haat/Locality',
        required: true,
        placeholder: 'Select hat',
      },
      {
        key: 'mouza_id',
        label: 'Mouza',
        required: false,
        placeholder: 'Select mouza',
      },
      {
        key: 'adsr_name',
        label: 'ADSR Name',
        required: false,
        placeholder: 'Select ADSR Office',
      },
      {
        key: 'stall_no',
        label: 'Stall No',
        required: true,
        placeholder: 'Enter stall number',
      },
      {
        key: 'holding_no',
        label: 'Holding No',
        required: true,
        placeholder: 'Enter holding number',
      },
      {
        key: 'jl_no',
        label: 'JL No',
        required: false,
        placeholder: 'Enter JL number',
      },
      {
        key: 'khatian_no',
        label: 'Khatian No',
        required: false,
        placeholder: 'Enter khatian number',
      },
      {
        key: 'plot_no',
        label: 'Plot No',
        required: false,
        placeholder: 'Enter plot number',
      },
      {
        key: 'area_com_sqft',
        label: 'Area (sqft)',
        required: true,
        placeholder: 'Enter commercial area in sqft',
      },
      {
        key: 'latitude',
        label: 'Latitude',
        required: false,
        placeholder: 'Enter latitude ',
      },
      {
        key: 'longitude',
        label: 'Longitude',
        required: false,
        placeholder: 'Enter longitude',
      },
      {
        key: 'sketch_map_attached',
        label: 'Sketch Map (Attachment)',
        required: false,
        placeholder: 'Upload sketch map',
        type: 'image',
      },
      {
        key: 'land_valuation_document',
        label: 'Land Valuation document (Attachment)',
        required: false,
        placeholder: 'Upload Land Valuation document',
        type: 'image',
      },
      {
        key: 'land_valuation_amount',
        label: 'Land Valuation Amount',
        required: false,
        placeholder: 'Enter Amount',
      },
      {
        key: 'user_id',
        label: 'User ID',
        required: true,
        placeholder: 'Enter user ID',
      },
    ],
  },
  {
    title: 'Images',
    icon: FileText,
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    description: 'Upload images related to the stall',
    fields: [
      {
        key: 'stall_image1',
        label: 'Stall Image 1',
        required: true,
        placeholder: 'Tap to select or take a photo',
        type: 'images',
      },
      {
        key: 'stall_image2',
        label: 'Stall Image 2',
        required: false,
        placeholder: 'Tap to select or take a photo',
        type: 'images',
      },
    ],
  },
  {
    title: 'Remarks',
    icon: MessageSquare,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    description: 'Additional notes',
    fields: [
      {
        key: 'remarks',
        label: 'Remarks',
        required: true,
        placeholder: 'Enter any additional remarks or notes',
        multiline: true,
      },
    ],
  },
];


export const licenseType = [
  { key: '1', value: 'Holding' },
  { key: '2', value: 'Stall' },
];

export const statusType = [
  { key: '1', value: 'Active' },
  { key: '2', value: 'Inactive' },
];
export const applicationStatus = [
  { key: '1', value: 'New' },
  { key: '2', value: 'Existing' },
  { key: '3', value: 'Transfer' },
];
export const usesType = [
  { key: '1', value: 'Commercial' },
  { key: '2', value: 'Residential cum Commercial' },
];
export const applicationFor = [
  { key: '1', value: 'Self' },
  { key: '2', value: 'Family' },
  { key: '3', value: 'Others' },
];
export const numericFields = [
    'mobile',
    'pin_code',
    'previous_license_no',
    'property_tax_payment_to_year',
    'occupy_from_year',
    'stall_no',
    'holding_no',
    'khatian_no',
    'plot_no',
    'area_com_sqft',
    'latitude',
    'longitude',
    'land_valuation_amount',
  ];

 export const getMaxLength = (key: string) => {
  const limits: any = { mobile: 10, pan: 10, holding_no: 10, stall_no: 10, previous_license_no: 10, jl_no: 6, khatian_no: 6, plot_no: 6, pin_code: 6, area_com_sqft: 6, property_tax_payment_to_year: 4, occupy_from_year: 4, land_valuation_amount: 10 };
  return limits[key];
};