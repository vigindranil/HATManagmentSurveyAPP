import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  Button,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building,
  User,
  FileText,
  Phone,
  MessageSquare,
  CircleCheck as CheckCircle,
  Circle,
  Calendar,
  XCircle, // CHANGED: Added the XCircle icon for the remove button
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { SelectList } from 'react-native-dropdown-select-list';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
// import { saveSurveyUser } from '@/api';
import {
  getAllDistrictList,
  getPoliceStationsByDistrictId,
  getMouzaListByThanaID,
  getAllHaatDetailsByDistrictID,
  saveSurveyOnline,
} from '@/api';
import * as ImagePicker from 'expo-image-picker';
import handleSignatureSaved from '@/utils/base64';

const { width } = Dimensions.get('window');

type ImageFieldType = {
  uri: string;
  name: string;
  type: string;
};

interface SurveyData {
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
  document_image: string;
  pan: string;
  pan_image: string;
  previous_license_no: string;
  license_expiry_date: string;
  property_tax_payment_to_year: string;
  land_transfer_explanation: string;
  occupy: string;
  occupy_from_year: string;
  present_occupier_name: string;
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
}

export default function Survey() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [district, setDistrict] = useState([]);
  const [policeStationOptions, setPoliceStationOptions] = useState([]);
  const [mouzaOptions, setMouzaOptions] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [haatAllDetailsOptions, setHaatAllDetailsOptions] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await AsyncStorage.getItem('user');
        if (user1) {
          const parsedUser = JSON.parse(user1);
          const parsedUser2 = JSON.parse(parsedUser.userDetails);
          if (parsedUser2) {
            updateField('user_id', String(parsedUser2.UserID));
            setUser(parsedUser2);
          }
        }
      } catch (error) {
        console.error('Error fetching user from AsyncStorage:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep]);

  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const yesNoOptions = [
    { key: 'true', value: 'Yes' },
    { key: 'false', value: 'No' },
  ];

  const documentTypes = [
    { key: '1', value: 'Aadhar' },
    { key: '2', value: 'Voter ID' },
  ];

  const steps = [
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
          label: 'Uses Type',
          required: true,
          placeholder: 'Select Uses Type',
        },
      ],
    },
    {
      title: 'Applicant Details',
      icon: FileText,
      color: '#F59E42',
      bgColor: '#FFF7ED',
      description: 'Applicant personal and document information',
      fields: [
        {
          key: 'name',
          label: 'Name',
          required: true,
          placeholder: 'Enter applicant name',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'guardian_name',
          label: "Guardian's Name",
          required: true,
          placeholder: "Enter father's/husband's name",
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'address',
          label: 'Address',
          required: true,
          placeholder: 'Enter address',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'mobile',
          label: 'Mobile Number',
          required: true,
          placeholder: 'Enter mobile number',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'citizenship',
          label: 'Citizenship',
          required: true,
          placeholder: 'Enter citizenship',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'pin_code',
          label: 'Pin Code',
          required: true,
          placeholder: 'Enter pin code',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'documentTypes',
          label: 'Document Type',
          required: true,
          placeholder: 'Select document type',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'document_image',
          label: 'Document Image',
          required: true,
          placeholder: 'Upload document image',
          showFor: ['new', 'existing', 'transfer', 'rent'],
          type: 'image',
        },
        {
          key: 'pan',
          label: 'PAN',
          required: true,
          placeholder: 'Enter PAN number',
          showFor: ['new', 'existing', 'transfer', 'rent'],
        },
        {
          key: 'pan_image',
          label: 'PAN Image',
          required: true,
          placeholder: 'Upload PAN image',
          showFor: ['new', 'existing', 'transfer', 'rent'],
          type: 'image',
        },
        {
          key: 'residential_certificate_attached',
          label: 'Residential Certificate (Attachment)',
          required: false,
          placeholder: 'Upload residential certificate',
          showFor: ['new', 'existing', 'transfer', 'rent'],
          type: 'image',
        },
        {
          key: 'trade_license_attached',
          label: 'Trade License (Attachment)',
          required: false,
          placeholder: 'Upload trade license',
          showFor: ['new', 'existing', 'transfer', 'rent'],
          type: 'image',
        },
        {
          key: 'previous_license_no',
          label: 'Previous License No',
          required: true,
          placeholder: 'Enter previous license number ',
          showFor: ['existing'],
        },
        {
          key: 'license_expiry_date',
          label: 'License Expiry Date',
          required: true,
          placeholder: 'Select license expiry date ',
          showFor: ['existing'],
          type: 'date',
        },
        {
          key: 'property_tax_payment_to_year',
          label: 'Property Tax Paid Up To Year',
          required: true,
          placeholder: 'Enter year up to which property tax is paid ',
          showFor: ['existing'],
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
          placeholder: 'Specify relationship ',
          showFor: ['transfer'],
          dependsOn: { key: 'is_within_family', value: false },
        },
        {
          key: 'land_transfer_explanation',
          label: 'Land Transfer Explanation',
          required: true,
          placeholder: 'Explain land transfer ',
          showFor: ['transfer'],
        },
        {
          key: 'occupy',
          label: 'Occupy',
          required: true,
          placeholder: 'Is property occupied? ',
          showFor: ['transfer'],
        },
        {
          key: 'occupy_from_year',
          label: 'Occupy From Year',
          required: true,
          placeholder: 'Enter year of occupation ',
          showFor: ['transfer'],
        },
        {
          key: 'present_occupier_name',
          label: 'Present Occupier Name',
          required: true,
          placeholder: 'Enter present occupier name',
          showFor: ['transfer'],
        },
        {
          key: 'occupier_guardian_name',
          label: "Occupier's Guardian Name",
          required: true,
          placeholder: "Enter occupier's guardian name ",
          showFor: ['transfer'],
        },
        {
          key: 'affidavit_attached',
          label: 'Affidavit (Attachment)',
          required: true,
          placeholder: 'Upload affidavit',
          showFor: ['transfer'],
          type: 'image',
        },
        {
          key: 'adsr_name',
          label: 'ADSR Name',
          required: true,
          placeholder: 'Enter ADSR name',
          showFor: ['transfer'],
        },
        {
          key: 'warision_certificate_attached',
          label: 'Warision Certificate (Attachment)',
          required: true,
          placeholder: 'Upload warision certificate ',
          showFor: ['transfer'],
          type: 'image',
        },
        {
          key: 'death_certificate_attached',
          label: 'Death Certificate (Attachment)',
          required: true,
          placeholder: 'Upload death certificate ',
          showFor: ['transfer'],
          type: 'image',
        },
        {
          key: 'noc_legal_heirs_attached',
          label: 'NOC Legal Heirs (Attachment)',
          required: true,
          placeholder: 'Upload NOC from legal heirs',
          showFor: ['transfer'],
          type: 'image',
        },
        {
          key: 'is_same_owner',
          label: 'Is Same Owner',
          required: true,
          placeholder: 'Is the owner the same?',
          showFor: ['rent'],
          type: 'dropdown',
        },
        {
          key: 'rented_to_whom',
          label: 'Rented To Whom',
          required: true,
          placeholder: 'Enter the name of the person/entity rented to',
          showFor: ['rent'],
          dependsOn: { key: 'is_same_owner', value: false },
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
          key: 'police_station_id',
          label: 'Police Station',
          required: true,
          placeholder: 'Select police station',
        },
        {
          key: 'hat_id',
          label: 'Hat',
          required: true,
          placeholder: 'Select hat',
        },
        {
          key: 'mouza_id',
          label: 'Mouza',
          required: true,
          placeholder: 'Select mouza',
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
          required: true,
          placeholder: 'Enter JL number',
        },
        {
          key: 'khatian_no',
          label: 'Khatian No',
          required: true,
          placeholder: 'Enter khatian number',
        },
        {
          key: 'plot_no',
          label: 'Plot No',
          required: true,
          placeholder: 'Enter plot number',
        },
        {
          key: 'area_dom_sqft',
          label: 'Area (Domestic, sqft)',
          required: true,
          placeholder: 'Enter domestic area in sqft',
        },
        {
          key: 'area_com_sqft',
          label: 'Area (Commercial, sqft)',
          required: true,
          placeholder: 'Enter commercial area in sqft',
        },
        {
          key: 'direction',
          label: 'Direction',
          required: true,
          placeholder: 'Enter direction',
        },
        {
          key: 'latitude',
          label: 'Latitude',
          required: true,
          placeholder: 'Enter latitude (optional)',
        },
        {
          key: 'longitude',
          label: 'Longitude',
          required: true,
          placeholder: 'Enter longitude (optional)',
        },
        {
          key: 'sketch_map_attached',
          label: 'Sketch Map (Attachment)',
          required: false,
          placeholder: 'Upload sketch map',
          type: 'image',
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
          label: 'Image 1',
          required: false,
          placeholder: 'Tap to select or take a photo',
          type: 'image',
        },
        {
          key: 'stall_image2',
          label: 'Image 2',
          required: false,
          placeholder: 'Tap to select or take a photo',
          type: 'image',
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

  const licenseType = [
    { key: '1', value: 'Holding' },
    { key: '2', value: 'Stall' },
  ];
  const applicationStatus = [
    { key: '1', value: 'New' },
    { key: '2', value: 'Existing' },
    { key: '3', value: 'Transfer' },
    { key: '4', value: 'Rent' },
  ];
  const usesType = [
    { key: '1', value: 'Commercial' },
    { key: '2', value: 'Residential cum Commercial' },
  ];
  const applicationFor = [
    { key: '1', value: 'Self' },
    { key: '2', value: 'Family' },
    { key: '3', value: 'Others' },
  ];

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtList = await getAllDistrictList();
        setDistrict(districtList?.data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, []);

  const updateField = (key: string, value: any) => {
    setSurveyData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImagePick = async (fieldKey: string) => {
    Alert.alert(
      '📸 Select Image Source',
      'How would you like to add or change the image?',
      [
        {
          text: '📷 Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });
            if (!result.canceled && result.assets) {
              const base64Image = await handleSignatureSaved(
                result.assets[0].uri
              );
              updateField(fieldKey, {
                uri: result.assets[0].uri,
                base: base64Image,
              });
            }
          },
        },
        {
          text: '🖼️ Device Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });
            if (!result.canceled && result.assets) {
              const base64Image = await handleSignatureSaved(
                result.assets[0].uri
              );
              updateField(fieldKey, {
                uri: result.assets[0].uri,
                base: base64Image,
              });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateStep = () => {
    const currentStepData = steps[currentStep];
    const statusMap: { [key: string]: string } = {
      '1': 'new',
      '2': 'existing',
      '3': 'transfer',
      '4': 'rent',
    };
    const currentStatusString =
      statusMap[surveyData.applicationStatus as string];

    for (const field of currentStepData.fields) {
      if (!field.required) continue;
      if (field.showFor && !field.showFor.includes(currentStatusString))
        continue;
      if (field.dependsOn) {
        const { key, value: requiredValue } = field.dependsOn;
        if (surveyData[key as keyof SurveyData] !== requiredValue) {
          continue;
        }
      }

      const fieldValue = surveyData[field.key as keyof SurveyData];
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === ''
      ) {
        Alert.alert('Validation Error', `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const numericFields = [
    'mobile',
    'pin_code',
    'previous_license_no',
    'property_tax_payment_to_year',
    'occupy_from_year',
    'stall_no',
    'holding_no',
    'jl_no',
    'khatian_no',
    'plot_no',
    'area_dom_sqft',
    'area_com_sqft',
    'latitude',
    'longitude',
  ];
  const formatDropdownData = (
    data: any[],
    keyField: string,
    valueField: string
  ) =>
    (data || []).map((item) => ({
      key: String(item[keyField]),
      value: String(item[valueField]),
    }));

  const nextStep = async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsSaving(true);
        try {
          const response = await saveSurveyOnline(surveyData);
          const message =
            response.status === 0
              ? `Survey submitted successfully! Your application number is ${response?.data?.applicationNumber}`
              : 'Survey submission failed. Please try again.';

          if (response.status === 0) {
            Dialog.show({
              type: ALERT_TYPE.SUCCESS,
              title: '🎉 Success!',
              textBody: message,
              button: 'OK',
              onHide: () => {
                if (response.status === 0) {
                  setSurveyData({ user_id: user ? String(user.UserID) : '' });
                  setCurrentStep(0);
                }
              },
              autoClose: false,
              closeOnOverlayTap: true,
              style: styles.dialogbox, // Center the alert vertically
            });
          } else {
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: '❌ Error!',
              textBody: message,
              button: 'OK',
              onHide: () => {
                if (response.status === 0) {
                  setSurveyData({ user_id: user ? String(user.UserID) : '' });
                  setCurrentStep(0);
                }
              },
              autoClose: false,
              closeOnOverlayTap: true,
              style: styles.dialogbox, // Center the alert vertically
            });
          }
        } catch (error) {
          console.error('Submission Error:', error);
          // Alert.alert('Error', 'Failed to save survey. Please try again.');
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: '🎉 Error!',
            textBody: `Failed to save survey. Please try again.`,
            button: 'OK',
            onHide: () => {
              setSurveyData({ user_id: user ? String(user.UserID) : '' });
              setCurrentStep(0);
            },
            autoClose: false,
            closeOnOverlayTap: true,
            style: styles.dialogbox,
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newData = { ...surveyData };
      const fieldsToClearCurrent = steps[currentStep].fields;
      const fieldsToClearPrevious = steps[currentStep - 1].fields;
      const allFieldsToClear = [
        ...fieldsToClearCurrent,
        ...fieldsToClearPrevious,
      ];
      allFieldsToClear.forEach((field) => {
        if (field.key !== 'user_id') {
          delete (newData as Partial<SurveyData>)[
            field.key as keyof SurveyData
          ];
        }
      });
      setSurveyData(newData);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDistrictChange = async (selectedKey: any) => {
    updateField('district_id', selectedKey);
    updateField('police_station_id', '');
    updateField('mouza_id', '');
    updateField('hat_id', '');
    setPoliceStationOptions([]);
    setMouzaOptions([]);
    setHaatAllDetailsOptions([]);
    try {
      const [policeStations, haatDetails] = await Promise.all([
        getPoliceStationsByDistrictId(selectedKey),
        getAllHaatDetailsByDistrictID(selectedKey),
      ]);
      setHaatAllDetailsOptions(haatDetails?.data || []);
      setPoliceStationOptions(policeStations?.data || []);
    } catch (error) {
      console.error('Error fetching dependent district data:', error);
    }
  };

  const handlePoliceStationChange = async (selectedKey: any) => {
    updateField('police_station_id', selectedKey);
    updateField('mouza_id', '');
    setMouzaOptions([]);
    try {
      const mouzaList = await getMouzaListByThanaID(selectedKey);
      setMouzaOptions(mouzaList?.data || []);
    } catch (error) {
      console.error('Error fetching mouza data:', error);
    }
  };

  const renderField = (field: any) => {
    const statusMap: { [key: string]: string } = {
      '1': 'new',
      '2': 'existing',
      '3': 'transfer',
      '4': 'rent',
    };
    const currentStatusString =
      statusMap[surveyData.applicationStatus as string];

    if (field.showFor && !field.showFor.includes(currentStatusString))
      return null;
    if (
      field.dependsOn &&
      surveyData[field.dependsOn.key as keyof SurveyData] !==
        field.dependsOn.value
    )
      return null;

    const value = surveyData[field.key as keyof SurveyData];

    const dropdownDataMap: Record<string, any[]> = {
      licenseType,
      applicationStatus,
      applicationFor,
      usesType,
      documentTypes,
    };

    if (dropdownDataMap[field.key] || field.type === 'dropdown') {
      const data =
        field.type === 'dropdown' ? yesNoOptions : dropdownDataMap[field.key];
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.inputContainer}>
            <SelectList
              setSelected={(val: any) =>
                updateField(
                  field.key,
                  val === 'true' ? true : val === 'false' ? false : val
                )
              }
              placeholder={field.placeholder}
              data={data}
              save="key"
              search={false}
              boxStyles={{
                borderWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
              dropdownStyles={{ borderWidth: 0, borderColor: 'transparent' }}
              dropdownTextStyles={{
                fontWeight: 'bold',
                color: '#111827',
                fontSize: 16,
              }}
              dropdownItemStyles={{
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                paddingVertical: 10,
                marginHorizontal: 10,
              }}
              inputStyles={{ color: '#000000', fontSize: 16 }}
            />
          </View>
        </View>
      );
    }

    if (
      ['district_id', 'police_station_id', 'mouza_id', 'hat_id'].includes(
        field.key
      )
    ) {
      let data: any[] = [],
        handler = (val: any) => updateField(field.key, val);
      if (field.key === 'district_id') {
        data = formatDropdownData(district, 'district_id', 'district_name');
        handler = handleDistrictChange;
      } else if (field.key === 'police_station_id') {
        data = formatDropdownData(
          policeStationOptions,
          'thana_id',
          'thana_name'
        );
        handler = handlePoliceStationChange;
      } else if (field.key === 'mouza_id') {
        data = formatDropdownData(mouzaOptions, 'mouza_id', 'mouza_name');
      } else if (field.key === 'hat_id') {
        data = formatDropdownData(
          haatAllDetailsOptions,
          'haat_id',
          'haat_name'
        );
      }
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.inputContainer}>
            <SelectList
              setSelected={handler}
              placeholder={field.placeholder}
              data={data}
              save="key"
              search={true}
              boxStyles={{
                borderWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
              dropdownStyles={{ borderWidth: 0, borderColor: 'transparent' }}
              dropdownTextStyles={{
                fontWeight: 'bold',
                color: '#111827',
                fontSize: 16,
              }}
              dropdownItemStyles={{
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                paddingVertical: 10,
                marginHorizontal: 10,
              }}
              inputStyles={{ color: '#000000', fontSize: 16 }}
            />
          </View>
        </View>
      );
    }

    // CHANGED: This block now renders the remove button when an image is present
    if (field.type === 'image') {
      const imageValue = value as ImageFieldType;
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => handleImagePick(field.key)}
          >
            {imageValue?.uri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageValue.uri }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => updateField(field.key, null)}
                >
                  <XCircle size={28} color="#DC2626" fill="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.imagePickerText}>{field.placeholder}</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (field.type === 'date') {
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Calendar color="#6B7280" size={20} style={{ marginRight: 10 }} />
            <Text style={{ color: '#111827', fontSize: 16 }}>
              {value
                ? new Date(value as string).toLocaleDateString()
                : 'Select Date'}
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
    }

    return (
      <View key={field.key} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label}{' '}
          {field.required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              field.multiline && styles.textInputMultiline,
            ]}
            value={(value as string) || ''}
            placeholder={field.placeholder}
            editable={field.key !== 'user_id'}
            placeholderTextColor="#9CA3AF"
            keyboardType={
              numericFields.includes(field.key) ? 'numeric' : 'default'
            }
            maxLength={field.key === 'mobile' ? 10 : undefined}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            onChangeText={(text) => updateField(field.key, text)}
          />
        </View>
      </View>
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;
          return (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isCurrent && [
                    styles.stepCurrent,
                    { backgroundColor: step.color },
                  ],
                ]}
              >
                {isCompleted ? (
                  <CheckCircle size={16} color="#ffffff" />
                ) : (
                  <StepIcon
                    size={16}
                    color={isCurrent ? '#ffffff' : '#9CA3AF'}
                  />
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[currentStepData.color, currentStepData.color + '90']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.headerIcon,
                { backgroundColor: currentStepData.bgColor },
              ]}
            >
              <StepIcon size={24} color={currentStepData.color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{currentStepData.title}</Text>
              <Text style={styles.headerSubtitle}>
                {currentStepData.description}
              </Text>
            </View>
          </View>
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>
              {currentStep + 1}/{steps.length}
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.stepIndicatorContainer}>{renderStepIndicator()}</View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContent}>
            {currentStepData.fields.map(renderField)}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
            <ChevronLeft size={20} color="#6B7280" />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 0 && styles.nextButtonFull,
          ]}
          onPress={nextStep}
          disabled={isSaving}
        >
          <LinearGradient
            colors={
              isSaving
                ? ['#9CA3AF', '#6B7280']
                : [currentStepData.color, currentStepData.color + 'CC']
            }
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isSaving
                ? 'Saving...'
                : currentStep === steps.length - 1
                ? 'Submit Survey'
                : 'Continue'}
            </Text>
            {currentStep < steps.length - 1 && (
              <ChevronRight size={20} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  stepCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepCounterText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#059669',
  },
  stepCurrent: {
    // backgroundColor set dynamically
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  datePickerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
  },
  textInputMultiline: {
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dialogbox: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  prevButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  imagePicked: {
    borderColor: '#0EA5E9',
  },
  imagePlaceholder: {
    borderColor: '#E5E7EB',
  },
  imagePlaceholderText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%', // Changed to fill container
    height: '100%', // Changed to fill container
    borderRadius: 6, // Match the button's radius
  },
  imagePickerText: {
    color: '#9CA3AF',
    fontSize: 20,
    textAlign: 'center',
  },
  imagePickerButton: {
    width: '50%',
    height: 150,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 3,
    marginBottom: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  // ADDED: These new styles handle the remove button on the image
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
  },
});
