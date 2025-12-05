import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage"
import CustomAlert from '@/components/CustomAlert';
import { isCameraOpenRef } from '@/utils/GPSGuard';
import { formatDropdownData } from '@/functions/survey_function';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck as CheckCircle,
  Calendar,
  XCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDashboard } from '@/context/dashboard-context';
import {
  getAllDistrictList,
  getPoliceStationsByDistrictId,
  getMouzaListByThanaID,
  getAllHaatDetailsByDistrictID,
  saveSurveyOnline,
  getJlNoByThanaId,
  getAdsrByThanaId,
  getUserDetailsByPhoneNumber
} from '@/api';
import *as ImagePicker from 'expo-image-picker';
import *as Location from 'expo-location';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { compressImageUri } from '@/utils/compressImage'
import {  yesNoOptions, documentTypes, transferRelationshipOptions,steps,licenseType, applicationStatus,applicationFor,usesType,numericFields,getMaxLength,statusType } from '../../constant/survey_constant';


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
  statusType: string;
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

// Define an interface for AlertInfo with a context property
interface AlertInfo {
  visible: boolean;
  type: 'success' | 'error' | 'Permission Denied' | 'Something went Wrong' | 'Survey Failure' | 'Invalid' | 'Missing Information' | 'Unauthorized' | 'Autofill Successful' | 'User Not Found' | 'User Details Unavailable'; // Extended types
  message: string;
  context?: 'survey_submission' | 'autofill_success' | 'unauthorized_access' | undefined; // Added 'unauthorized_access' context
}

export default function Survey() {
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [district, setDistrict] = useState([]);
  const [policeStationOptions, setPoliceStationOptions] = useState([]);
  const [mouzaOptions, setMouzaOptions] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [haatAllDetailsOptions, setHaatAllDetailsOptions] = useState([]);
  const [adsrOptions, setAdsrOptions] = useState([]);
  const [jlNOOptions, setJlNOOptions] = useState([]); 
  const [mobileAutofillSuccessful, setMobileAutofillSuccessful] = useState(false);
   const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState(new Date()); // Correct useState for date
  const [showPicker, setShowPicker] = useState(false);
  const [loadingImage, setLoadingImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [blockMunicipalityOptions, setBlockMunicipalityOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  // NEW REF: Tracks the status/type that was active the last time the user successfully clicked "Next" on Step 0.
  const lastConfirmedStep0State = useRef<{ licenseType: string | null, applicationStatus: string | null }>({
    licenseType: null,
    applicationStatus: null
  });

  // Initialize alertInfo with context
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    visible: false,
    type: 'success', // 'success' or 'error'
    message: '',
    context: undefined, // Initialize context
  });
  const { setUser: setUsers, setIsAuthenticated } = useAuth();
  const { setNeedsRefresh } = useDashboard();

  console.log("surveyData",surveyData);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user1 = await AsyncStorage.getItem('user');
        if (user1) {
          const parsedUser = JSON.parse(user1);
          const parsedUser2 = JSON.parse(parsedUser.userDetails);
          if (parsedUser2) {
            updateField('user_id', String(parsedUser2.UserID));
            updateField('citizenship', 'Indian');
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

 

    useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      
    });

    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
     
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtList = await getAllDistrictList();
       if(districtList?.status === 0){
        setDistrict(formatDropdownData(districtList?.data || [], 'district_id', 'district_name'));
       }
       else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching districts.',
        }); 
       }
      } catch (err) {
        const error = err as any;
        if (error.status === 401) {
          // Show alert for unauthorized access
          setAlertInfo({
            visible: true,
            type: 'Unauthorized',
            message: 'Your session has expired. Please log in again.',
            context: 'unauthorized_access',
          });
        } else {
          console.error('Error fetching districts:', error.message);
        }
      }
    };
    fetchDistricts();
  }, []);

  const handleAlertConfirm = () => {
    setAlertInfo({ ...alertInfo, visible: false });
    if (alertInfo.type === 'success' && alertInfo.context === 'survey_submission') {
      setSurveyData({ user_id: user ? String(user.UserID) : '', citizenship: 'Indian' });
      setCurrentStep(0);
      lastConfirmedStep0State.current = { licenseType: null, applicationStatus: null };
    }
    // NEW: Handle unauthorized access context after alert dismissal
    if (alertInfo.context === 'unauthorized_access') {
      setUsers(null);
      setIsAuthenticated(false);
      AsyncStorage.removeItem('user').then(() => {
        router.replace('/(auth)/login');
      });
    }
  };

  
  const updateField = (key: string, value: any) => {
    setSurveyData((prev) => {
      const prevValue = prev[key as keyof SurveyData];
      const strPrev = prevValue === null || prevValue === undefined ? '' : String(prevValue);
      const strNew = value === null || value === undefined ? '' : String(value);

      if (strPrev === strNew) {
        return prev;
      }
      return { ...prev, [key]: value };
    });
  };

  const processImage = async (fieldKey: string, location : boolean) => {
    Keyboard.dismiss();
    isCameraOpenRef.current = true;
    Alert.alert(
      '📸 Select Image Source',
      'How would you like to add or change the image?',
      [
        {
          text: '📷 Camera',
          onPress: async () => {
            try {
              setLoadingImage(fieldKey);
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.7,
                exif: true,
              });

              if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                const compressedUri = await compressImageUri(asset.uri);
                if(location){
                let latitude = asset.exif?.GPSLatitude;
                let longitude = asset.exif?.GPSLongitude;

                if (!latitude || !longitude) {
                  const { status } =
                    await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    setAlertInfo({ visible: true, type: 'Permission Denied', message: 'Location permission is required.' });
                    return;
                  }
                  const loc = await Location.getCurrentPositionAsync({});
                  latitude = loc.coords.latitude;
                  longitude = loc.coords.longitude;
                }
                updateField('latitude', String(latitude));
                updateField('longitude', String(longitude));
              }
              updateField(fieldKey, { uri: compressedUri });
            }
            } catch (err) {
              console.error('Camera pick failed:', err);
            } finally {
              setLoadingImage(null);
              isCameraOpenRef.current = false;
            }
          },
        },
        {
          text: '🖼️ Device Gallery',
          onPress: async () => {
            isCameraOpenRef.current = true;
            try {
              setLoadingImage(fieldKey);
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.7,
                exif: true,
              });

              if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                const compressedUri = await compressImageUri(asset.uri);
                if(Location){
                let latitude = asset.exif?.GPSLatitude;
                let longitude = asset.exif?.GPSLongitude;

                if (!latitude || !longitude) {
                  const { status } =
                    await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    setAlertInfo({ visible: true, type: 'Permission Denied', message: 'Location permission is required.' });
                    return;
                  }
                  const loc = await Location.getCurrentPositionAsync({});
                  latitude = loc.coords.latitude;
                  longitude = loc.coords.longitude;
                }
                updateField('latitude', String(latitude));
                updateField('longitude', String(longitude));
              }
              updateField(fieldKey, { uri: compressedUri });
            }
            } catch (err) {
              console.error('Gallery pick failed:', err);
            } finally {
              setLoadingImage(null);
              isCameraOpenRef.current = false;
            }
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => { isCameraOpenRef.current = false; } },
      ]
    );
  };

  const validateStep = () => {
    const currentStepData = steps[currentStep];
    const statusMap: { [key: string]: string } = {
      '1': 'new',
      '2': 'existing',
      '3': 'transfer',
    };
    const currentStatusString =
      statusMap[surveyData.applicationStatus as string];

    for (const field of currentStepData.fields) {
      if (field.key === 'holding_no' && surveyData.licenseType !== '1')
        continue;
      if (field.key === 'stall_no' && surveyData.licenseType !== '2') continue;

      if (currentStatusString === 'transfer' && (field.key === 'previous_license_no' || field.key === 'license_expiry_date' || field.key === 'property_tax_payment_to_year' || field.key === 'license_image')) {
        continue;
      }

      if (!field.required) continue;
      if (field.showFor && !field.showFor.includes(currentStatusString))
        continue;
      if (field.dependsOn) {
        const { key, value: requiredValue } = field.dependsOn;
        if (surveyData[key as keyof SurveyData] !== requiredValue) {
          continue;
        }
      }

      let fieldLabel = field.label; // Default to 'Document Number'

      if ((field.key === 'documentNumber' || field.key === 'document_image') && surveyData.documentTypes) {
        const selectedDoc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
        if (selectedDoc) {
          const suffix = field.key === 'document_image' ? ' Image' : ' Number';
          fieldLabel = `${selectedDoc.value}${suffix}`; // Becomes 'Aadhar Number' or 'Voter ID Number'
        }
      }

      const fieldValue = surveyData[field.key as keyof SurveyData] as string;
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === ''
      ) {
        setAlertInfo({
          visible: true,
          type: 'Missing Information',
          message: `${fieldLabel} is required`,
        });
        return false;
      }


       if (field.key === 'documentNumber') {
        const val = fieldValue ? fieldValue.trim() : '';

        // 1. Aadhar Validation (Type '1')
        // Rule: Must be exactly 12 numeric digits
        if (surveyData.documentTypes === '1') {
          const aadharRegex = /^[0-9]{12}$/;
          if (!aadharRegex.test(val)) {
            setAlertInfo({
              visible: true,
              type: 'Invalid Format',
              message: 'Invalid Aadhar Number. It must be exactly 12 digits.',
            });
            return false;
          }
        }

        // 2. Voter ID Validation (Type '2')
        // Rule: Standard EPIC format is 3 Letters + 7 Digits (e.g., ABC1234567)
        if (surveyData.documentTypes === '2') {
          // Check for 3 letters followed by 7 digits
          const voterRegex = /^[A-Za-z]{3}[0-9]{7}$/;
          if (!voterRegex.test(val)) {
            setAlertInfo({
              visible: true,
              type: 'Invalid Format',
              message: 'Invalid Voter ID. Format should be 3 letters followed by 7 digits (e.g., ABC1234567).',
            });
            return false;
          }
        }
      }

      if (field.key === 'pan') {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(fieldValue)) {
          setAlertInfo({
            visible: true,
            type: 'Invalid',
            message: 'Invalid PAN format. Please use the format ABCDE1234F.',
          });
          return false;
        }
      }


      if (field.key === 'land_valuation_amount') {

        const amount = parseFloat(fieldValue);
        if (isNaN(amount)) {
          setAlertInfo({
            visible: true,
            type: 'Invalid Amount',
            message: 'Please enter a valid numeric value for the Land Valuation Amount.',
          });
          return false;
        }

        if (amount < 1000) {
          setAlertInfo({
            visible: true,
            type: 'Amount Too Low',
            message: 'The Land Valuation Amount must be at least ₹1,000.',
          });
          return false;
        }
      }

      if (field.key === 'mobile') {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(fieldValue)) {
          setAlertInfo({
            visible: true,
            type: 'Invalid',
            message: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.',
          });
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {

        // --- NEW LOGIC: Handling Step 0 Transitions ---
        if (currentStep === 0) {
          setSurveyData(prev => {
            const newData = { ...prev };

            const currentType = newData.licenseType;
            const currentStatus = newData.applicationStatus;
            // Get the status/type that were active LAST time we moved forward
            const lastStatus = lastConfirmedStep0State.current.applicationStatus;

            // 1. License Type Consistency (Always enforce this logic)
            if (currentType === '1') delete newData['stall_no']; // Holding
            if (currentType === '2') delete newData['holding_no']; // Stall

            // 2. Application Status Logic
            const transferOnlyFields = [
              'is_within_family', 'transfer_relationship', 'land_transfer_explanation',
              'occupy', 'occupy_from_year', 'present_occupier_name', 'occupier_guardian_name',
              'affidavit_attached', 'warision_certificate_attached', 'death_certificate_attached', 'noc_legal_heirs_attached'
            ];
            const sharedFields = [
              'previous_license_no', 'license_expiry_date', 'property_tax_payment_to_year', 'license_image'
            ];

            const statusChanged = currentStatus !== lastStatus;

            if (statusChanged) {
             
              if (currentStatus === '1') { // New
                // Wipe everything
                transferOnlyFields.forEach(k => delete newData[k]);
                sharedFields.forEach(k => delete newData[k]);
              } else {
                // Existing (2) or Transfer (3)
                // User switched status. Wipe the shared fields to force fresh entry.
                sharedFields.forEach(k => delete newData[k]);
                // If not Transfer, wipe transfer fields
                if (currentStatus !== '3') {
                  transferOnlyFields.forEach(k => delete newData[k]);
                }
              }
            } else {
              if (currentStatus === '1') { // New - always clear just to be safe
                transferOnlyFields.forEach(k => delete newData[k]);
                sharedFields.forEach(k => delete newData[k]);
              } else if (currentStatus === '2') { // Existing
                // Just ensure Transfer fields are gone (in case they were filled in a different session)
                transferOnlyFields.forEach(k => delete newData[k]);
              }
              // If Transfer (3), we delete nothing. Persist all.
            }

            return newData;
          });

          // Update the Ref so we know what the "current" valid state is for next time
          lastConfirmedStep0State.current = {
            licenseType: surveyData.licenseType as string,
            applicationStatus: surveyData.applicationStatus as string
          };
        }

        setCurrentStep(currentStep + 1);
      } else {
        setIsSaving(true);
        try {
          const response = await saveSurveyOnline(surveyData);
          const messages = 
            response.status === 0
              ? `Survey submitted successfully! Your application number is ${response?.data?.applicationNumber}`
              : 'Survey submission failed. Please try again.';

          if (response.status === 0) {
            setAlertInfo({
              visible: true,
              type: 'success',
              message: messages,
              context: 'survey_submission',
            });
            setNeedsRefresh(true);
            setMobileAutofillSuccessful(false);
          } else {
            setAlertInfo({
              visible: true,
              type: 'Something went Wrong',
              message: messages,
            });                        
          }
        } catch (err) {
          const error = err as any;
          if (error.status === 401) {
            // Show alert for unauthorized access
            setAlertInfo({
              visible: true,
              type: 'Unauthorized',
              message: 'Your session has expired. Please log in again.',
              context: 'unauthorized_access',
            });
          } else {
            setAlertInfo({
              visible: true,
              type: 'Survey Failure',
              message: 'Failed to save survey. Please try again.',
            });
            console.error('Submission Error:', error.message);
          }
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // setMobileAutofillSuccessful(false); // REMOVED to persist locked state
    }
  };

  const handleDistrictChange = async (selectedKey: any) => {
    const districtId = String(selectedKey);
    // Prevent wiping if selecting the same district
    if (surveyData.district_id === districtId) return;

    updateField('district_id', districtId);
    // Clear all dependent fields in surveyData to empty string
    updateField('police_station_id', '');
    updateField('mouza_id', '');
    updateField('hat_id', '');
    updateField('adsr_name', '');
    updateField('jl_no', '');
    updateField('block_municipality_id', '');
    updateField('ward_id', '');

    // Clear options for dependent dropdowns
    setPoliceStationOptions([]);
    setMouzaOptions([]);
    setHaatAllDetailsOptions([]);
    setAdsrOptions([]);
    setJlNOOptions([]); // Clear JL No options here too
    setBlockMunicipalityOptions([]);
    setWardOptions([]);

    if (!districtId) return;

    try {
      const [policeStations, haatDetails] = await Promise.all([
        getPoliceStationsByDistrictId(districtId),
        getAllHaatDetailsByDistrictID(districtId),
      ]);
      if(haatDetails?.status === 0){
      setHaatAllDetailsOptions(formatDropdownData(haatDetails?.data || [], 'haat_id', 'haat_name'));
      }else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching haat details.',
        }); 
      }
      if(policeStations?.status === 0){
      setPoliceStationOptions(formatDropdownData(policeStations?.data || [], 'thana_id', 'thana_name'));
      }else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching police stations.',
         
        }); 
      }
    } catch (err) {
      const error = err as any;
      if (error.status === 401) {
        // Show alert for unauthorized access
        setAlertInfo({
          visible: true,
          type: 'Unauthorized',
          message: 'Your session has expired. Please log in again.',
          context: 'unauthorized_access',

        });
      } else {
        console.error('Error fetching dependent district data:', error.message);
      }
    }
  };

  

  const handlePoliceStationChange = async (selectedKey: any) => {
    const thanaId = String(selectedKey);
    // Prevent wiping if selecting the same police station
    if (surveyData.police_station_id === thanaId) return;

    updateField('police_station_id', thanaId);

    // Clear all dependent fields in surveyData to empty string
    updateField('mouza_id', '');
    updateField('adsr_name', '');
    updateField('jl_no', '');

    // Clear options for dependent dropdowns
    setMouzaOptions([]);
    setAdsrOptions([]);
    setJlNOOptions([]); // Clear JL No options here too

    if (!thanaId) return;

    try {
      const [mouzaList, adsrList, jlNoData] = await Promise.all([
        getMouzaListByThanaID(thanaId),
        getAdsrByThanaId(thanaId),
        getJlNoByThanaId(thanaId)
      ]);
      if(mouzaList?.status === 0){
      setMouzaOptions(formatDropdownData(mouzaList?.data || [], 'mouza_id', 'mouza_name'));
      }else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching mouza list.',
         
        }); 
      }
      if(adsrList?.status === 0){
      const formattedAdsrData = formatDropdownData(adsrList?.data || [], 'adsr_name', 'adsr_name');
    
      setAdsrOptions(formattedAdsrData);
      }else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching adsr list.',
         
        }); 
      }
      if(jlNoData?.status === 0){
      // Format JL No data and set its options
      const formattedJlNOData = formatDropdownData(jlNoData?.data || [], 'jl_no', 'jl_no');
        
      setJlNOOptions(formattedJlNOData);
      }else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching JL No list.',
         
        }); 
      }
    } catch (err) {
      const error = err as any;
      if (error.status === 401) {
        // Show alert for unauthorized access
        setAlertInfo({
          visible: true,
          type: 'Unauthorized',
          message: 'Your session has expired. Please log in again.',
          context: 'unauthorized_access',
        });
      } else {
        setAlertInfo({
          visible: true,
          type: 'Something went Wrong',
          message: 'Something went wrong while fetching mouza, ADSR, or JL No data.',
         
        }); 
      }
    }
  };

  const renderField = (field: any) => {
    const statusMap: { [key: string]: string } = {
      '1': 'new',
      '2': 'existing',
      '3': 'transfer',
    };
    const currentStatusString =
      statusMap[surveyData.applicationStatus as string];

    if (field.key === 'holding_no' && surveyData.licenseType !== '1')
      return null;
    if (field.key === 'stall_no' && surveyData.licenseType !== '2') return null;
    if (
      field.key === 'user_id' ||
      field.key === 'latitude' ||
      field.key === 'longitude'
    )
      return null;

    if (field.showFor && !field.showFor.includes(currentStatusString))
      return null;
    if (
      field.dependsOn &&
      surveyData[field.dependsOn.key as keyof SurveyData] !==
      field.dependsOn.value
    )
      return null;


      if ((field.key === 'document_image' || field.key === 'documentNumber') && !surveyData.documentTypes) {
      return null;
    }

    

    let displayLabel = field.label;
    
    if (field.key === 'document_image' && surveyData.documentTypes) {
      // Find the label (e.g., 'Aadhar') based on the key selected
      const selectedDoc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
      if (selectedDoc) {
        displayLabel = `${selectedDoc.value} Image`; // e.g., "Aadhar Image"
      }
    }

    if (field.key === 'documentNumber' && surveyData.documentTypes) {
      // Find the label (e.g., 'Aadhar') based on the key selected
      const selectedDoc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
      if (selectedDoc) {
        displayLabel = `${selectedDoc.value} Number`; // e.g., "Aadhar Image"
      }
    }


    const value = surveyData[field.key as keyof SurveyData];

    const dropdownDataMap: Record<string, any[]> = {
      licenseType,
      applicationStatus,
      applicationFor,
      usesType,
      documentTypes,
      statusType,
      transfer_relationship: transferRelationshipOptions,
    };

    let selectedValueForSelectList = '';
    if (value !== null && value !== undefined) {
      if (field.type === 'dropdown') {
        selectedValueForSelectList = value === true ? 'true' : value === false ? 'false' : String(value);
      } else {
        selectedValueForSelectList = String(value);
      }
    }

    // Determine the dynamic key for SelectList components to force remount
    let selectListKey = field.key; // Default key
    if (field.key === 'police_station_id') {
      selectListKey = `${field.key}-${surveyData.district_id || 'none'}`;
    } else if (['mouza_id', 'hat_id', 'adsr_name', 'jl_no'].includes(field.key)) {
      selectListKey = `${field.key}-${surveyData.police_station_id || 'none'}`;
    }


    // Render standard dropdowns (not dynamically fetched based on other fields)
    // This condition checks if the field is in dropdownDataMap AND is NOT one of the dependent dropdowns
    if (dropdownDataMap[field.key] || (field.type === 'dropdown' && !['district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', 'block_municipality_id','ward_id'].includes(field.key))) {
      const data = dropdownDataMap[field.key] || yesNoOptions; // Use dropdownDataMap first, fallback to yesNoOptions if field.type is 'dropdown'
      const saveType = 'key';

      // MODIFIED: Calculate defaultOption to ensure UI persistence
      let defaultOptionObj = undefined;
      if (value !== null && value !== undefined) {
        const strVal = String(value);
        const foundItem = data.find(item => item.key === strVal);
        if (foundItem) {
          defaultOptionObj = { key: strVal, value: foundItem.value };
        }
      }

      let lockedLabel = null; // If this is set, the field becomes read-only
      
      // 1. Lock Usage Type to 'Commercial' if License Type is 'Stall' (2)
      if (field.key === 'usesType' && surveyData.licenseType === '2') {
        lockedLabel = 'Commercial';
      }

      // 2. Lock Application For to 'Self' if Status is 'New' (1) or 'Existing' (2)
      if (field.key === 'applicationFor' && (surveyData.applicationStatus === '1' || surveyData.applicationStatus === '2')) {
        lockedLabel = 'Self';
      }


      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && !(currentStatusString === 'transfer' && ['previous_license_no', 'license_expiry_date', 'property_tax_payment_to_year',].includes(field.key)) && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.inputContainer}>
             {lockedLabel ? (            
              <TextInput 
                style={[styles.textInput, { color: '#6B7280', backgroundColor: '#F5F5F5',borderRadius: 10 }]} // Grey text
                value={lockedLabel} // Hardcoded display value
                editable={false}   // Prevent editing
              />
            ):(
            <SelectList
              key={selectListKey} // Apply dynamic key
              setSelected={(val: any) => {
                let valueToStore = val;
                if (typeof val === 'object' && val !== null && 'key' in val) {
                  valueToStore = val.key;
                }
                const finalValue = valueToStore === 'true' ? true : valueToStore === 'false' ? false : String(valueToStore);

                // --- 2. CLEAR IMAGE IF DOCUMENT TYPE CHANGES (NEW) ---
                if (field.key === 'documentTypes') {
                   // If the value is actually changing, clear the image field
                   if (surveyData.documentTypes !== finalValue) {
                     updateField('document_image', null); 
                   }
                }

                if (field.key === 'documentTypes') {
                 if (surveyData.documentTypes !== finalValue) {
                     updateField('documentNumber', null); 
                   }
                }



                if (field.key === 'licenseType') {
                    // If switching to Stall (2)
                    if (finalValue === '2') {
                        updateField('usesType', '1'); // Force 'Commercial'
                    } 
                    // If switching to Holding (1) (or anything else)
                    else {
                        // Check if we need to clear (only if it was previously Stall/Commercial)
                        // Or just strictly clear it every time they change license type to be safe:
                        updateField('usesType', ''); 
                    }
                  }

                   if (field.key === 'applicationStatus') {
                    if (finalValue === '1' || finalValue === '2') {
                        // If New (1) or Existing (2) -> Force 'Self' (1)
                        updateField('applicationFor', '1');
                    } else {
                        // If Transfer (3) -> Clear so user can choose Self/Family/Others
                        updateField('applicationFor', '');
                    }
                  }
                updateField(field.key, finalValue);
              }}
              placeholder={field.placeholder}
              data={data}
              save={saveType}
              search={false}
              selected={selectedValueForSelectList}
              defaultOption={defaultOptionObj} // Added defaultOption here
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
            />)}
          </View>
        </View>
      );
    }

    // Render dependent dropdowns (District, Police Station, Mouza, Hat, ADSR, JL No)
    if (
      ['district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', `block_municipality_id`,`ward_id`].includes(
        field.key
      )
    ) {
      let data: any[] = [];
      let currentFieldHandler = (val: any) => {
        let valueToStore = val;
        if (typeof val === 'object' && val !== null && 'key' in val) {
          valueToStore = val.key;
        }

        if (field.key === 'district_id') {
          handleDistrictChange(String(valueToStore));
        } else if (field.key === 'police_station_id') {
          handlePoliceStationChange(String(valueToStore));
        } else {
          updateField(field.key, String(valueToStore));
        }
      };

      if (field.key === 'district_id') {
        data = district;
      } else if (field.key === 'police_station_id') {
        data = policeStationOptions;
      } else if (field.key === 'mouza_id') {
        data = mouzaOptions;
      } else if (field.key === 'hat_id') {
        data = haatAllDetailsOptions;
      }
      else if (field.key === 'adsr_name') {
        data = adsrOptions;
      }
      else if (field.key === 'jl_no') {
        data = jlNOOptions; // Use the formatted JL No options
      }

      // MODIFIED: Calculate defaultOption to ensure UI persistence
      let defaultOptionObj = undefined;
      if (value !== null && value !== undefined) {
        const strVal = String(value);
        const foundItem = data.find(item => item.key === strVal);
        if (foundItem) {
          defaultOptionObj = { key: strVal, value: foundItem.value };
        }
      }

      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.inputContainer}>
            <SelectList
              key={selectListKey} // Apply dynamic key for all dependent dropdowns
              setSelected={currentFieldHandler}
              placeholder={field.placeholder}
              data={data}
              save="key"
              search={true}
              selected={selectedValueForSelectList}
              defaultOption={defaultOptionObj} // Added defaultOption here
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

    if (field.type === 'image') {
      const imageValue =
        typeof value === 'object' && value !== null && 'uri' in value
          ? (value as ImageFieldType)
          : undefined;
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {displayLabel}{' '} 
            {field.required && !(currentStatusString === 'transfer' && field.key === 'license_image') && <Text style={styles.required}>*</Text>}
          </Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => processImage(field.key, false)}
          >
            {loadingImage === field.key ? (
              <View style={styles.imagePreviewContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : imageValue?.uri ? (
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

    if (field.type === 'images') {
      const imageValue =
        typeof value === 'object' && value !== null && 'uri' in value
          ? (value as ImageFieldType)
          : undefined;
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label}{' '}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => processImage(field.key, true)}
          >
            {loadingImage === field.key ? (
              <View style={styles.imagePreviewContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : imageValue?.uri ? (
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
            {field.required && !(currentStatusString === 'transfer' && field.key === 'license_expiry_date') && <Text style={styles.required}>*</Text>}
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

    const isEditable = field.key !== 'user_id' && field.key !== 'citizenship';
    //  !(currentStatusString === 'transfer' && (field.key === 'previous_license_no' || field.key === 'license_expiry_date'));

    const isAutoFilledField = ['name', 'guardian_name', 'address', 'pin_code', 'pan'].includes(field.key);
    // NEW: Use mobileAutofillSuccessful to determine if the field should be disabled by autofill
    const isDisabledByAutoFill = isAutoFilledField && mobileAutofillSuccessful;
    let fieldYPosition = 0;

     let fieldMaxLength = getMaxLength(field.key);
    
    if (field.key === 'documentNumber') {
      if (surveyData.documentTypes === '1') {
        fieldMaxLength = 12; // Aadhar is exactly 12 digits
      } else {
        fieldMaxLength = 10; // Voter ID can be longer/alphanumeric
      }
    }

     const isNumericKeyboard = 
      numericFields.includes(field.key) || 
      (field.key === 'documentNumber' && surveyData.documentTypes === '1'); // '1' is Aadhar


    return (
      <View
        key={field.key}
        style={styles.fieldContainer}
        onLayout={(event) => {
          fieldYPosition = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.fieldLabel}>
          {displayLabel}{' '}
          {field.required && !(currentStatusString === 'transfer' && (field.key === 'previous_license_no' || field.key === 'license_expiry_date' || field.key === "property_tax_payment_to_year")) && <Text style={styles.required}>*</Text>}

        </Text>
        <View style={[styles.inputContainer,  (!isEditable || isDisabledByAutoFill) && { backgroundColor: '#F3F4F6' }]}>
          <TextInput
            style={[
              styles.textInput,
              (field.multiline || field.key === 'land_transfer_explanation') && styles.textInputMultiline,
             
            ]}
            value={(value as string) || ''}
            placeholder={field.placeholder}
            editable={isEditable && !isDisabledByAutoFill} // This is the crucial line for enabling/disabling
            placeholderTextColor="#9CA3AF"
             keyboardType={isNumericKeyboard ? 'numeric' : 'default'}
            maxLength={fieldMaxLength}
            autoCapitalize={field.key === 'pan' ? 'characters' : 'sentences'}
            multiline={field.multiline || field.key === 'land_transfer_explanation'}
            numberOfLines={field.multiline || field.key === 'land_transfer_explanation' ? 4 : 1}
            onFocus={() => {
              if (fieldYPosition > 0) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: fieldYPosition - 100,
                    animated: true,
                  });
                }, 100);
              }
            }}
            onChangeText={(text) => {
              updateField(field.key, text);
              // Trigger API call when 10 digits are entered for mobile
              if (field.key === 'mobile' && text.length === 10) {
                getUserDetailsByPhoneNumber(text)
                  .then(response => {
                    if(response?.status !== 0){
                      setAlertInfo({
                        visible: true,
                        type: 'Something went Wrong',
                        message: 'Something went wrong.',
                       
                      }); 
                    } 
                    if (response?.data && response?.status === 0) {
                      setMobileAutofillSuccessful(true); // Autofill successful
                      // Update fields only if they are currently empty or not explicitly set by the user
                      if (!surveyData.name) updateField('name', response.data.shop_owner_name || '');
                      if (!surveyData.guardian_name) updateField('guardian_name', response.data.guardian_name || '');
                      if (!surveyData.address) updateField('address', response.data.address || '');
                      if (!surveyData.pin_code) updateField('pin_code', response.data.pin_code || '');
                      if (!surveyData.pan) updateField('pan', response.data.pan_number || '');
                      setAlertInfo({
                        visible: true,
                        type: 'Autofill Successful',
                        message: 'User details autofilled!',
                        context: 'autofill_success',
                      });
                    } else {
                      setMobileAutofillSuccessful(false); // No data found, allow manual edit
                      // If no data found, explicitly clear fields so they become editable
                      updateField('name', '');
                      updateField('guardian_name', '');
                      updateField('address', '');
                      updateField('pin_code', '');
                      updateField('pan', '');
                      setAlertInfo({
                        visible: true,
                        type: 'User Not Exist',
                        message: 'No existing user found. Please fill details manually.',
                      });
                    }
                  })
                  .catch(error => {
                    console.error('Error fetching user details:', error);
                    setMobileAutofillSuccessful(false); // API call failed, allow manual edit
                    // If API call fails, explicitly clear fields so they become editable
                    updateField('name', '');
                    updateField('guardian_name', '');
                    updateField('address', '');
                    updateField('pin_code', '');
                    updateField('pan', '');
                    setAlertInfo({
                      visible: true,
                      type: 'User Details Unavailable',
                      message: 'Error fetching user details. Please fill manually.',
                    });
                  });
              } else if (field.key === 'mobile' && text.length < 10) {
                // If mobile number is incomplete or cleared by user, allow manual editing
                setMobileAutofillSuccessful(false); // Reset the flag
                // Optionally clear related autofilled fields immediately as mobile is no longer complete
                updateField('name', '');
                updateField('guardian_name', '');
                updateField('address', '');
                updateField('pin_code', '');
                updateField('pan', '');
              }
            }}
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
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
       
        {alertInfo.visible && (
          <CustomAlert
            type={alertInfo.type}
            message={alertInfo.message}
            onConfirm={handleAlertConfirm}
            // onCancel={() => { }}
          />
        )}
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

        {/* 3. Step Indicator is also moved OUTSIDE KeyboardAvoidingView */}
        <View style={styles.stepIndicatorContainer}>{renderStepIndicator()}</View>

      
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.formContainer}
              contentContainerStyle={{
                paddingBottom: 150
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContent}>
                {currentStepData.fields.map(renderField)}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.formContainer}
              contentContainerStyle={{
                paddingBottom: keyboardVisible ? 40 : 110
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContent}>
                {currentStepData.fields.map(renderField)}
              </View>
            </ScrollView>
          </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
      

      {/* 
        5. Button Container (footer) OUTSIDE SafeAreaView 
           to keep it fixed at the bottom, behind keyboard.
      */}
      <View style={[styles.buttonContainer]}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[
              styles.prevButton,
              (isSaving || !!loadingImage) && { backgroundColor: '#D1D5DB' } // Tailwind gray-300
            ]}
            onPress={prevStep}
            disabled={isSaving || !!loadingImage}
          >
            <ChevronLeft size={20} color={(isSaving || !!loadingImage) ? "#9CA3AF" : "#6B7280"} />
            <Text
              style={[
                styles.prevButtonText,
                (isSaving || !!loadingImage) && { color: '#9CA3AF' }
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 0 && styles.nextButtonFull,
          ]}
          onPress={nextStep}
          disabled={isSaving || !!loadingImage}
        >
          <LinearGradient
            colors={
              (isSaving || loadingImage)
                ? ['#9CA3AF', '#6B7280']
                : [currentStepData.color, currentStepData.color + 'CC']
            }
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isSaving
                ? 'Saving...'
                : loadingImage
                  ? 'Processing...'
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    // marginBottom: -20,
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
    borderRadius: 12,
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
    // Removed paddingBottom here as KeyboardAvoidingView handles it
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
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    borderColor: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
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