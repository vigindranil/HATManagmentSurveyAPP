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
  getUserDetailsByPhoneNumber,
  getBlocksOrMunicipalitiesByDistrictId,
  getBoundaryDetailsByBoundaryID
} from '@/api';
import *as ImagePicker from 'expo-image-picker';
import *as Location from 'expo-location';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { compressImageUri } from '@/utils/compressImage'
import {  yesNoOptions, documentTypes, transferRelationshipOptions,steps,licenseType, applicationStatus,applicationFor,usesType,numericFields,getMaxLength,statusType,blockOrMunicipalityType } from '../../constant/survey_constant';


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
  const [rawBlockMuniList, setRawBlockMuniList] = useState<any[]>([]);

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
        updateField('district_id', '9');
        handleDistrictChange(9);
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
      setSurveyData({ user_id: user ? String(user.UserID) : '', citizenship: 'Indian', district_id: '9' });
      setCurrentStep(0);
      lastConfirmedStep0State.current = { licenseType: null, applicationStatus: null };
       handleDistrictChange('9'); 
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
      // ---------------------------------------------------------
      // 1. VISIBILITY CHECKS (Skip hidden fields)
      // ---------------------------------------------------------
      if (field.key === 'holding_no' && surveyData.licenseType !== '1')
        continue;
      if (field.key === 'stall_no' && surveyData.licenseType !== '2') continue;

      if (currentStatusString === 'transfer' && (field.key === 'previous_license_no' || field.key === 'license_expiry_date' || field.key === 'property_tax_payment_to_year' || field.key === 'license_image')) {
        continue;
      }

      if (field.showFor && !field.showFor.includes(currentStatusString))
        continue;
      if (field.dependsOn) {
        const { key, value: requiredValue } = field.dependsOn;
        if (surveyData[key as keyof SurveyData] !== requiredValue) {
          continue;
        }
      }

      // ---------------------------------------------------------
      // 2. GET VALUE & CHECK IF EMPTY
      // ---------------------------------------------------------
      const rawValue = surveyData[field.key as keyof SurveyData];
      const fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
      const hasValue = fieldValue.trim() !== '';

      // *** CHANGE START ***
      // If field is OPTIONAL and EMPTY, skip validation entirely.
      if (!field.required && !hasValue) {
        continue;
      }
      // *** CHANGE END ***

      // ---------------------------------------------------------
      // 3. DETERMINE LABEL (For Alerts)
      // ---------------------------------------------------------
      let fieldLabel = field.label; 

      if ((field.key === 'documentNumber' || field.key === 'document_image') && surveyData.documentTypes) {
        const selectedDoc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
        if (selectedDoc) {
          const suffix = field.key === 'document_image' ? ' Image' : ' Number';
          fieldLabel = `${selectedDoc.value}${suffix}`; 
        }
      }

      if (field.key === 'block_municipality_id') {
        if (surveyData.block_or_municipality === '1') fieldLabel = "Block Name";
        else if (surveyData.block_or_municipality === '2') fieldLabel = "Municipality Name";
      }

      if (field.key === 'ward_id') {
        if (surveyData.block_or_municipality === '1') fieldLabel = "Gram Panchayat";
        else if (surveyData.block_or_municipality === '2') fieldLabel = "Ward No";
      }

      // ---------------------------------------------------------
      // 4. REQUIRED FIELD CHECK
      // ---------------------------------------------------------
      if (field.required && !hasValue) {
        setAlertInfo({
          visible: true,
          type: 'Missing Information',
          message: `${fieldLabel} is required`,
        });
        return false;
      }

      // ---------------------------------------------------------
      // 5. SPECIFIC VALIDATIONS (Runs for Required OR Optional-with-Value)
      // ---------------------------------------------------------

      if (field.key === 'documentNumber') {
        const val = fieldValue.trim();
        // 1. Aadhar Validation
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
        // 2. Voter ID Validation
        if (surveyData.documentTypes === '2') {
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

      // *** LAND VALUATION CHECK ***
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

        // --- EXISTING STEP 0 LOGIC ---
        if (currentStep === 0) {
          setSurveyData(prev => {
            const newData = { ...prev };
            const currentType = newData.licenseType;
            const currentStatus = newData.applicationStatus;
            const lastStatus = lastConfirmedStep0State.current.applicationStatus;

            if (currentType === '1') delete newData['stall_no']; 
            if (currentType === '2') delete newData['holding_no']; 

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
              if (currentStatus === '1') { 
                transferOnlyFields.forEach(k => delete newData[k]);
                sharedFields.forEach(k => delete newData[k]);
              } else {
                sharedFields.forEach(k => delete newData[k]);
                if (currentStatus !== '3') {
                  transferOnlyFields.forEach(k => delete newData[k]);
                }
              }
            } else {
              if (currentStatus === '1') { 
                transferOnlyFields.forEach(k => delete newData[k]);
                sharedFields.forEach(k => delete newData[k]);
              } else if (currentStatus === '2') { 
                transferOnlyFields.forEach(k => delete newData[k]);
              }
            }
            return newData;
          });

          lastConfirmedStep0State.current = {
            licenseType: surveyData.licenseType as string,
            applicationStatus: surveyData.applicationStatus as string
          };
        }

        // --- NEW: DATA CLEANUP FOR DEPENDENT FIELDS ---
        // This runs on every step to ensure data consistency
        setSurveyData(prev => {
          const newData = { ...prev };

          // 1. Cleanup for "Is Within Family"
          // If user selected "No", remove the relationship data
          if (newData.is_within_family === false) {
            delete newData['transfer_relationship'];
          }

          // 2. Cleanup for "Is Property Occupied"
          // If user selected "No", remove all occupier details
          if (newData.occupy === false) {
            delete newData['occupy_from_year'];
            delete newData['present_occupier_name'];
            delete newData['occupier_guardian_name'];
            // If you have an address field for occupier, delete it here too
          }

          return newData;
        });

        setCurrentStep(currentStep + 1);
      } else {
        // --- SUBMISSION LOGIC ---
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


   const handleBlockTypeChange = async (type: string) => {
    // 1. Update the type
    updateField('block_or_municipality', type);

    // 2. Clear children fields
    updateField('block_municipality_id', '');
    updateField('ward_id', '');
    
    // 3. Clear children options
    setBlockMunicipalityOptions([]);
    setWardOptions([]);

    const districtId = '9';

    // We need a district selected before fetching blocks/munis
    if (!districtId) {
       setAlertInfo({ visible: true, type: 'Missing Information', message: 'Please select a District first.' });
       return; 
    }

    try {
      let response;
      if (type === '1') {
        // User selected BLOCK -> Fetch Blocks
        response = await getBlocksOrMunicipalitiesByDistrictId(Number(districtId), Number(type));
        if (response?.status === 0) {
            // Assuming API returns id: block_id, name: block_name
            setRawBlockMuniList(response?.data);
            setBlockMunicipalityOptions(formatDropdownData(response.data || [], 'boundary_id', 'boundary_name'));
        }
        else {
          setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch block/municipality data.' });
        }
      } else {
        // User selected MUNICIPALITY -> Fetch Municipalities
        response = await getBlocksOrMunicipalitiesByDistrictId(Number(districtId), Number(type));
        if (response?.status === 0) {
            // Assuming API returns id: municipality_id, name: municipality_name
            setRawBlockMuniList(response?.data);
            setBlockMunicipalityOptions(formatDropdownData(response.data || [], 'boundary_id', 'boundary_name'));
        }
        else {
          setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch block/municipality data.' });
        }
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
          setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch block/municipality data.' });
        }
      
     
      
    }
  };



  // 2. Handles selection of a specific Block or Municipality
  const handleBlockMunicipalityIdChange = async (selectedId: string) => {
    updateField('block_municipality_id', selectedId);
    
    // Reset Child (Ward/GP)
    updateField('ward_id', '');
    setWardOptions([]);

    if (!selectedId) return;

    // 1. FIND THE EXTRA DATA (Level ID)
    const selectedObject = rawBlockMuniList.find(
      (item) => String(item.boundary_id) === String(selectedId)
    );

    const levelId = selectedObject ? selectedObject.boundary_level_id : null;

    // Optional: If you need to store level_id in surveyData for saving later
    // updateField('boundary_level_id', String(levelId)); 

    const type = surveyData.block_or_municipality; // '1' = Block, '2' = Muni

    try {
      let response;
      if (type === '1') {
        // Fetch GPs (Pass ID and Level ID if API requires it)
        // Assuming your API function accepts levelId as 2nd param
        response = await getBoundaryDetailsByBoundaryID(Number(levelId), Number(selectedId), 0, Number(user?.UserID)); 
        
        if (response?.status === 0) {
            // Adjust mapping based on GP API response structure
            setWardOptions(formatDropdownData(response.data || [], 'inner_boundary_id', 'inner_boundary_name'));
        }else {
          setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch GP/Ward data.' });
        }
      } else {
        // Fetch Wards (Pass ID and Level ID)
        response = await getBoundaryDetailsByBoundaryID(Number(levelId), Number(selectedId), 0, Number(user?.UserID));
        
        if (response?.status === 0) {
             // Adjust mapping based on Ward API response structure
            setWardOptions(formatDropdownData(response.data || [], 'inner_boundary_id', 'inner_boundary_name'));
          }else {
            setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch GP/Ward data.' });
          }
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
        console.error('Error fetching GP/Ward:', error.message);
        setAlertInfo({ visible: true, type: 'Something went Wrong', message: 'Failed to fetch GP/Ward.' });
      }
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
    updateField('block_or_municipality', ''); // Reset the type selector
    updateField('block_municipality_id', ''); // Reset the specific Block/Muni
    updateField('ward_id', '');               // Reset GP/Ward

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
    // ============================================================
    // 1. VISIBILITY & HIDING CHECKS
    // ============================================================
    const statusMap: { [key: string]: string } = { '1': 'new', '2': 'existing', '3': 'transfer' };
    const currentStatusString = statusMap[surveyData.applicationStatus as string];

    // Standard specific field checks
    if (field.key === 'holding_no' && surveyData.licenseType !== '1') return null;
    if (field.key === 'stall_no' && surveyData.licenseType !== '2') return null;
    if (['user_id', 'latitude', 'longitude'].includes(field.key)) return null;

    // Check 'showFor' (New/Existing/Transfer)
    if (field.showFor && !field.showFor.includes(currentStatusString)) return null;

    // Check 'dependsOn' (e.g., is_within_family)
    if (field.dependsOn && surveyData[field.dependsOn.key as keyof SurveyData] !== field.dependsOn.value) return null;

    // Check Document Type dependencies
    if ((field.key === 'document_image' || field.key === 'documentNumber') && !surveyData.documentTypes) return null;

    // >>> WATERFALL VISIBILITY LOGIC <<<
    // 1. Hide "Block/Muni Name" until "Type" (Block/Municipality) is selected
    if (field.key === 'block_municipality_id' && !surveyData.block_or_municipality) return null;
    
    // 2. Hide "GP/Ward" until "Type" is selected
    if (field.key === 'ward_id' && !surveyData.block_or_municipality) return null;


    // ============================================================
    // 2. DYNAMIC LABEL CALCULATION
    // ============================================================
    let displayLabel = field.label;

    // Change Label: Block Name vs Municipality Name
    if (field.key === 'block_municipality_id') {
      if (surveyData.block_or_municipality === '1') displayLabel = "Block Name";
      else if (surveyData.block_or_municipality === '2') displayLabel = "Municipality Name";
    }

    // Change Label: GP vs Ward
    if (field.key === 'ward_id') {
      if (surveyData.block_or_municipality === '1') displayLabel = "Gram Panchayat";
      else if (surveyData.block_or_municipality === '2') displayLabel = "Ward No";
    }

    // Change Label: Document Name
    if ((field.key === 'document_image' || field.key === 'documentNumber') && surveyData.documentTypes) {
      const selectedDoc = documentTypes.find(d => d.key === String(surveyData.documentTypes));
      if (selectedDoc) displayLabel = `${selectedDoc.value}${field.key === 'document_image' ? ' Image' : ' Number'}`;
    }

    const value = surveyData[field.key as keyof SurveyData];


    // ============================================================
    // 3. STANDARD DROPDOWNS (Includes Block/Muni Type)
    // ============================================================
    const dropdownDataMap: Record<string, any[]> = {
      licenseType,
      applicationStatus,
      applicationFor,
      usesType,
      documentTypes,
      statusType,
      block_or_municipality: blockOrMunicipalityType,
      transfer_relationship: transferRelationshipOptions,
    };

    if (
      (dropdownDataMap[field.key] || field.type === 'dropdown') && 
      !['district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', 'block_municipality_id', 'ward_id'].includes(field.key)
    ) {
      const data = dropdownDataMap[field.key] || yesNoOptions;

      // Find Default Option
      let defaultOptionObj = undefined;
      if (value !== null && value !== undefined) {
        const strVal = String(value);
        const foundItem = data.find(item => item.key === strVal);
        if (foundItem) defaultOptionObj = { key: strVal, value: foundItem.value };
      }

      // Logic for Locked/Disabled Fields
      let lockedLabel = null;
      let isDisabled = false;
      let disabledPlaceholder = field.placeholder;

      // Business Logic Locks
      if (field.key === 'usesType' && surveyData.licenseType === '2') lockedLabel = 'Commercial';
      if (field.key === 'applicationFor' && ['1', '2'].includes(surveyData.applicationStatus as string)) lockedLabel = 'Self';

      // Block Type Logic: Disable if District not selected
      if (field.key === 'block_or_municipality' && !surveyData.district_id) {
        isDisabled = true;
        disabledPlaceholder = "Select District first";
      }

      // Dynamic Key to reset Block/Muni Type when District changes
      let standardDropdownKey = field.key;
      if (field.key === 'block_or_municipality') {
          standardDropdownKey = `${field.key}-${surveyData.district_id || 'none'}`;
      }

      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {displayLabel} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={[styles.inputContainer, isDisabled && { backgroundColor: '#F3F4F6' }]}>
            {lockedLabel ? (
               <TextInput style={[styles.textInput, { color: '#6B7280', backgroundColor: '#F5F5F5', borderRadius: 10 }]} value={lockedLabel} editable={false} />
            ) : isDisabled ? (
               <View style={{ padding: 16, justifyContent: 'center' }}>
                 <Text style={{ color: '#9CA3AF', fontSize: 16 }}>{disabledPlaceholder}</Text>
               </View>
            ) : (
              <SelectList
                key={standardDropdownKey}
                setSelected={(val: any) => {
                  let v = typeof val === 'object' && 'key' in val ? val.key : val;
                  const finalValue = v === 'true' ? true : v === 'false' ? false : String(v);

                  if (field.key === 'block_or_municipality') {
                    handleBlockTypeChange(finalValue); 
                  } else {
                    if (field.key === 'documentTypes' && surveyData.documentTypes !== finalValue) {
                      updateField('document_image', null); updateField('documentNumber', null);
                    }
                    if (field.key === 'licenseType' && finalValue === '2') updateField('usesType', '1');
                    if (field.key === 'licenseType' && finalValue !== '2') updateField('usesType', '');
                    if (field.key === 'applicationStatus') updateField('applicationFor', (finalValue === '1' || finalValue === '2') ? '1' : '');
                    
                    updateField(field.key, finalValue);
                  }
                }}
                data={data}
                save="key"
                search={false}
                placeholder={field.placeholder}
                defaultOption={defaultOptionObj}
                boxStyles={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 14 }}
                dropdownStyles={{ borderWidth: 0 }}
                dropdownTextStyles={{ fontWeight: 'bold', color: '#111827', fontSize: 16 }}
                dropdownItemStyles={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10, marginHorizontal: 10 }}
                inputStyles={{ color: '#000000', fontSize: 16 }}
              />
            )}
          </View>
        </View>
      );
    }

    // ============================================================
    // 4. DEPENDENT / API DROPDOWNS
    // ============================================================
    if (['district_id', 'police_station_id', 'mouza_id', 'hat_id', 'adsr_name', 'jl_no', 'block_municipality_id', 'ward_id'].includes(field.key)) {
      
      let data: any[] = [];
      let isDisabled = false;
      let disabledPlaceholder = "";
      
      let currentFieldHandler = (val: any) => {
        let v = typeof val === 'object' && 'key' in val ? val.key : val;
        updateField(field.key, String(v));
      };

      // A. Block / Municipality Name 
      if (field.key === 'block_municipality_id') {
        data = blockMunicipalityOptions; 
        currentFieldHandler = (val: any) => {
           let v = typeof val === 'object' && 'key' in val ? val.key : val;
           handleBlockMunicipalityIdChange(String(v));
        };
      }
      
      // B. GP / Ward 
      else if (field.key === 'ward_id') {
        data = wardOptions; 
        // Disable if Parent Name is not selected
        if (!surveyData.block_municipality_id) {
           isDisabled = true;
           const parentNameLabel = surveyData.block_or_municipality === '1' ? "Block Name" : "Municipality Name";
           disabledPlaceholder = `Select ${parentNameLabel} first`;
        }
      }

      // C. District
      else if (field.key === 'district_id') {
        data = district;
        currentFieldHandler = (val: any) => {
           let v = typeof val === 'object' && 'key' in val ? val.key : val;
           handleDistrictChange(String(v));
        };
        // >>> LOCK DISTRICT ALWAYS (As requested) <<<
        isDisabled = true; 
      }
      
      // D. Other Fields
      else if (field.key === 'police_station_id') {
        data = policeStationOptions;
        if (!surveyData.district_id) { isDisabled = true; disabledPlaceholder = "Select District first"; }
        currentFieldHandler = (val: any) => {
           let v = typeof val === 'object' && 'key' in val ? val.key : val;
           handlePoliceStationChange(String(v));
        };
      }
      else if (field.key === 'hat_id') {
        data = haatAllDetailsOptions;
        if (!surveyData.district_id) { isDisabled = true; disabledPlaceholder = "Select District first"; }
      }
      else {
        if (field.key === 'mouza_id') data = mouzaOptions;
        if (field.key === 'adsr_name') data = adsrOptions;
        if (field.key === 'jl_no') data = jlNOOptions;
        if (!surveyData.police_station_id) { isDisabled = true; disabledPlaceholder = "Select Police Station first"; }
      }

      // 1. Find the Selected Object & Locked Label Logic
      let defaultOptionObj = undefined;
      let lockedLabel = ""; 

      if (value !== null && value !== undefined) {
        const strVal = String(value);
        const foundItem = data.find(item => item.key === strVal);
        
        if (foundItem) {
            defaultOptionObj = { key: strVal, value: foundItem.value };
            lockedLabel = foundItem.value; 
        } 
      }

      // 2. Unique Key Generation
      // Ensures the component re-renders when parents change, but NOT when it selects its own value (prevents bugs)
      let selectListKey = `${field.key}`;
      if (field.key === 'block_municipality_id') {
         selectListKey = `${field.key}-${surveyData.district_id}-${surveyData.block_or_municipality}`;
      } else if (field.key === 'ward_id') {
         selectListKey = `${field.key}-${surveyData.block_municipality_id}`;
      } else if (['mouza_id', 'hat_id', 'adsr_name', 'jl_no'].includes(field.key)) {
         selectListKey = `${field.key}-${surveyData.police_station_id || 'none'}`;
      } else if (field.key === 'police_station_id') {
         selectListKey = `${field.key}-${surveyData.district_id || 'none'}`;
      }

      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {displayLabel} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={[styles.inputContainer, isDisabled && { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
            
            {/* SHOW TEXT INPUT IF DISABLED & LOCKED LABEL EXISTS (e.g. "JALPAIGURI") */}
            {isDisabled && lockedLabel ? (
                <TextInput 
                    style={[styles.textInput, { color: '#6B7280', backgroundColor: '#F5F5F5', borderRadius: 10, fontWeight:'600' }]} 
                    value={lockedLabel} 
                    editable={false} 
                />
            ) : isDisabled ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' }}>
                <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: '400' }}>{disabledPlaceholder || "Loading..."}</Text>
              </View>
            ) : (
              <SelectList
                key={selectListKey}
                setSelected={currentFieldHandler}
                data={data}
                placeholder={field.placeholder}
                save="key"
                search={true}
                defaultOption={defaultOptionObj}
                boxStyles={{ borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 14 }}
                dropdownStyles={{ borderWidth: 0 }}
                dropdownTextStyles={{ fontWeight: 'bold', color: '#111827', fontSize: 16 }}
                dropdownItemStyles={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10, marginHorizontal: 10 }}
                inputStyles={{ color: '#000000', fontSize: 16 }}
              />
            )}
          </View>
        </View>
      );
    }

    // ============================================================
    // 5. IMAGE PICKERS
    // ============================================================
    if (field.type === 'image' || field.type === 'images') {
        const isMulti = field.type === 'images';
        const imageValue = typeof value === 'object' && value !== null && 'uri' in value ? (value as ImageFieldType) : undefined;
        return (
            <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{displayLabel} {field.required && !(currentStatusString === 'transfer' && field.key === 'license_image') && <Text style={styles.required}>*</Text>}</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={() => processImage(field.key, isMulti)}>
                {loadingImage === field.key ? ( <View style={styles.imagePreviewContainer}><ActivityIndicator size="large" color="#2563EB" /></View> ) 
                : imageValue?.uri ? (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageValue.uri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => updateField(field.key, null)}><XCircle size={28} color="#DC2626" fill="#ffffff" /></TouchableOpacity>
                </View> ) 
                : ( <Text style={styles.imagePickerText}>{field.placeholder}</Text> )}
            </TouchableOpacity>
            </View>
        );
    }

    // ============================================================
    // 6. DATE PICKER
    // ============================================================
    if (field.type === 'date') {
        return (
            <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label} {field.required && !(currentStatusString === 'transfer' && field.key === 'license_expiry_date') && <Text style={styles.required}>*</Text>}</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
                    <Calendar color="#6B7280" size={20} style={{ marginRight: 10 }} />
                    <Text style={{ color: '#111827', fontSize: 16 }}>{value ? new Date(value as string).toLocaleDateString() : 'Select Date'}</Text>
                </TouchableOpacity>
                {showPicker && (<DateTimePicker value={value ? new Date(value as string) : date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if (d) updateField(field.key, d.toISOString().split('T')[0]); }} />)}
            </View>
        );
    }

    // ============================================================
    // 7. TEXT INPUTS
    // ============================================================
    const isEditable = field.key !== 'user_id' && field.key !== 'citizenship';
    const isAutoFilledField = ['name', 'guardian_name', 'address', 'pin_code', 'pan'].includes(field.key);
    const isDisabledByAutoFill = isAutoFilledField && mobileAutofillSuccessful;
    
    let fieldMaxLength = getMaxLength(field.key);
    if (field.key === 'documentNumber') fieldMaxLength = surveyData.documentTypes === '1' ? 12 : 10;
    
    const isNumericKeyboard = numericFields.includes(field.key) || (field.key === 'documentNumber' && surveyData.documentTypes === '1');
    let fieldYPosition = 0;

    return (
        <View key={field.key} style={styles.fieldContainer} onLayout={(event) => { fieldYPosition = event.nativeEvent.layout.y; }}>
            <Text style={styles.fieldLabel}>{displayLabel} {field.required && !(currentStatusString === 'transfer' && (field.key === 'previous_license_no' || field.key === 'license_expiry_date' || field.key === "property_tax_payment_to_year")) && <Text style={styles.required}>*</Text>}</Text>
            <View style={[styles.inputContainer, (!isEditable || isDisabledByAutoFill) && { backgroundColor: '#F3F4F6' }]}>
            <TextInput
                style={[styles.textInput, (field.multiline || field.key === 'land_transfer_explanation') && styles.textInputMultiline]}
                value={(value as string) || ''}
                placeholder={field.placeholder}
                editable={isEditable && !isDisabledByAutoFill}
                placeholderTextColor="#9CA3AF"
                keyboardType={isNumericKeyboard ? 'numeric' : 'default'}
                maxLength={fieldMaxLength}
                autoCapitalize={field.key === 'pan' ? 'characters' : 'sentences'}
                multiline={field.multiline || field.key === 'land_transfer_explanation'}
                numberOfLines={field.multiline || field.key === 'land_transfer_explanation' ? 4 : 1}
                onFocus={() => { if (fieldYPosition > 0) { setTimeout(() => { scrollViewRef.current?.scrollTo({ y: fieldYPosition - 100, animated: true }); }, 100); } }}
                onChangeText={(text) => {
                updateField(field.key, text);
                if (field.key === 'mobile') {
                    if (text.length === 10) {
                        getUserDetailsByPhoneNumber(text).then(response => {
                            if (response?.data && response?.status === 0) {
                                setMobileAutofillSuccessful(true);
                                if (!surveyData.name) updateField('name', response.data.shop_owner_name || '');
                                if (!surveyData.guardian_name) updateField('guardian_name', response.data.guardian_name || '');
                                if (!surveyData.address) updateField('address', response.data.address || '');
                                if (!surveyData.pin_code) updateField('pin_code', response.data.pin_code || '');
                                if (!surveyData.pan) updateField('pan', response.data.pan_number || '');
                                setAlertInfo({ visible: true, type: 'Autofill Successful', message: 'User details autofilled!', context: 'autofill_success' });
                            } else {
                                setMobileAutofillSuccessful(false);
                                ['name', 'guardian_name', 'address', 'pin_code', 'pan'].forEach(k => updateField(k, ''));
                                setAlertInfo({ visible: true, type: 'User Not Found', message: 'No existing user found.' });
                            }
                        }).catch(() => { setMobileAutofillSuccessful(false); ['name', 'guardian_name', 'address', 'pin_code', 'pan'].forEach(k => updateField(k, '')); });
                    } else if (text.length < 10) { setMobileAutofillSuccessful(false); }
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