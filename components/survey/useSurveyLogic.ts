import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useDashboard } from '@/context/dashboard-context';
import { isCameraOpenRef } from '@/utils/GPSGuard';
import { compressImageUri } from '@/utils/compressImage';
import { formatDropdownData } from '@/functions/survey_function';
import { SurveyData, AlertInfo } from './SurveyTypes';
import {
    getAllDistrictList,
    getPoliceStationsByDistrictId,
    getMouzaListByThanaID,
    getAllHaatDetailsByDistrictID,
    saveSurveyOnline,
    getJlNoByThanaId,
    getAdsrByThanaId,
    getBlocksOrMunicipalitiesByDistrictId,
    getBoundaryDetailsByBoundaryID
} from '@/api';
import { steps } from '../../constant/survey_constant';
import { isFieldVisible, getCleanedDataBeforeStepChange, validateField } from './utils/surveyUtils';

export const useSurveyLogic = (scrollViewRef: React.RefObject<any>) => {
    // --- STATE ---
    const [currentStep, setCurrentStep] = useState(0);
    const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});
    const [user, setUser] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingImage, setLoadingImage] = useState<string | null>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [mobileAutofillSuccessful, setMobileAutofillSuccessful] = useState(false);
    const [isPanAutofilled, setIsPanAutofilled] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());

    // Options State
    const [district, setDistrict] = useState<any[]>([]);
    const [policeStationOptions, setPoliceStationOptions] = useState<any[]>([]);
    const [mouzaOptions, setMouzaOptions] = useState<any[]>([]);
    const [haatAllDetailsOptions, setHaatAllDetailsOptions] = useState<any[]>([]);
    const [adsrOptions, setAdsrOptions] = useState<any[]>([]);
    const [jlNOOptions, setJlNOOptions] = useState<any[]>([]);
    const [blockMunicipalityOptions, setBlockMunicipalityOptions] = useState<any[]>([]);
    const [wardOptions, setWardOptions] = useState<any[]>([]);
    const [rawBlockMuniList, setRawBlockMuniList] = useState<any[]>([]);

    const [alertInfo, setAlertInfo] = useState<AlertInfo>({
        visible: false,
        type: 'success',
        message: '',
        context: undefined,
    });

    const lastConfirmedStep0State = useRef<{ licenseType: string | null, applicationStatus: string | null }>({
        licenseType: null,
        applicationStatus: null
    });

    const { setUser: setUsers, setIsAuthenticated } = useAuth();
    const { setNeedsRefresh, needsRefresh } = useDashboard();

    // --- HELPERS ---
    const triggerError = (type: AlertInfo['type'], message: string) => {
        setAlertInfo({ visible: true, type, message });
        return false;
    };
    const triggerUnauthorized = () => setAlertInfo({ visible: true, type: 'Unauthorized', message: 'Session expired. Log in again.', context: 'unauthorized_access' });

    const updateField = useCallback((key: string, value: any) => {
        setSurveyData(prev => (prev[key as keyof SurveyData] === value ? prev : { ...prev, [key]: value }));
    }, []);

    // --- API HANDLERS ---
    const handleDistrictChange = async (districtId: string) => {
        if (surveyData.district_id === districtId) return;
        setSurveyData(prev => ({ ...prev, district_id: districtId, police_station_id: '', mouza_id: '', hat_id: '', adsr_name: '', jl_no: '', block_or_municipality: '', block_municipality_id: '', ward_id: '' }));
        setPoliceStationOptions([]); setMouzaOptions([]); setHaatAllDetailsOptions([]); setAdsrOptions([]); setJlNOOptions([]); setBlockMunicipalityOptions([]); setWardOptions([]);
        if (!districtId) return;
        try {
            const ps = await getPoliceStationsByDistrictId(districtId);
            const haats = await getAllHaatDetailsByDistrictID(districtId);
            if (haats?.status === 0) setHaatAllDetailsOptions(formatDropdownData(haats.data || [], 'haat_id', 'haat_name'));
            if (ps?.status === 0) setPoliceStationOptions(formatDropdownData(ps.data || [], 'police_station_id', 'police_station_name'));
        } catch (err: any) { if (err.status === 401) triggerUnauthorized(); }
    };

    const handlePoliceStationChange = async (thanaId: string) => {
        if (surveyData.police_station_id === thanaId) return;
        setSurveyData(prev => ({ ...prev, police_station_id: thanaId, mouza_id: '', adsr_name: '', jl_no: '' }));
        setMouzaOptions([]); setAdsrOptions([]); setJlNOOptions([]);
        if (!thanaId) return;
        try {
            const [mouzas, adsr, jl] = await Promise.all([getMouzaListByThanaID(thanaId), getAdsrByThanaId(thanaId), getJlNoByThanaId(thanaId)]);
            if (mouzas?.status === 0) setMouzaOptions(formatDropdownData(mouzas.data || [], 'mouza_id', 'mouza_name'));
            if (adsr?.status === 0) setAdsrOptions(formatDropdownData(adsr.data || [], 'adsr_name', 'adsr_name'));
            if (jl?.status === 0) setJlNOOptions(formatDropdownData(jl.data || [], 'jl_no', 'jl_no'));
        } catch (err: any) { if (err.status === 401) triggerUnauthorized(); }
    };

    const handleBlockTypeChange = async (type: string) => {
        updateField('block_or_municipality', type);
        setSurveyData(prev => ({ ...prev, block_municipality_id: '', ward_id: '' }));
        setBlockMunicipalityOptions([]); setWardOptions([]);
        try {
            const res = await getBlocksOrMunicipalitiesByDistrictId(9, Number(type));
            if (res?.status === 0) {
                setRawBlockMuniList(res.data);
                setBlockMunicipalityOptions(formatDropdownData(res.data || [], 'boundary_id', 'boundary_name'));
            }
        } catch (err: any) { if (err.status === 401) triggerUnauthorized(); }
    };

    const handleBlockMunicipalityIdChange = async (id: string) => {
        updateField('block_municipality_id', id);
        setSurveyData(prev => ({ ...prev, ward_id: '' })); setWardOptions([]);
        if (!id) return;
        const levelId = rawBlockMuniList.find(i => String(i.boundary_id) === String(id))?.boundary_level_id;
        try {
            const res = await getBoundaryDetailsByBoundaryID(Number(levelId), Number(id), 0, Number(user?.UserID));
            if (res?.status === 0) setWardOptions(formatDropdownData(res.data || [], 'inner_boundary_id', 'inner_boundary_name'));
        } catch (err: any) { if (err.status === 401) triggerUnauthorized(); }
    };

    // --- NAVIGATION ---
    const validateCurrentStep = useCallback(() => {
        const fields = steps[currentStep].fields;
        for (const field of fields) {
            if (!isFieldVisible(field, surveyData)) continue;
            const val = String(surveyData[field.key as keyof SurveyData] || '').trim();
            const result = validateField(field, val, surveyData);
            if (!result.valid) return triggerError(result.type as any, result.message!);
        }
        return true;
    }, [currentStep, surveyData]);

    const nextStep = async () => {
        if (!validateCurrentStep()) return;
        if (currentStep < steps.length - 1) {
            if (currentStep === 0) {
                const cleaned = getCleanedDataBeforeStepChange(surveyData, lastConfirmedStep0State.current.applicationStatus);
                setSurveyData(cleaned);
                lastConfirmedStep0State.current = { licenseType: cleaned.licenseType as string, applicationStatus: cleaned.applicationStatus as string };
            }
            setCurrentStep(s => s + 1);
        } else {
            submitSurvey();
        }
    };

    const submitSurvey = async () => {
        setIsSaving(true);
        try {
            const res = await saveSurveyOnline(surveyData);
            if (res.status === 0) {
                setAlertInfo({ visible: true, type: 'success', message: `Application Submitted! ID: ${res.data?.applicationNumber}`, context: 'survey_submission' });
                setNeedsRefresh(!needsRefresh);
            } else { triggerError('Something went Wrong', 'Submission failed.'); }
        } catch (err: any) { err.status === 401 ? triggerUnauthorized() : triggerError('Survey Failure', 'Failed to save survey.'); }
        finally { setIsSaving(false); }
    };

    const processImage = async (fieldKey: string, location: boolean) => {
        Keyboard.dismiss();
        isCameraOpenRef.current = true;
        Alert.alert('📸 Select Source', 'Choose image source', [
            { text: '📷 Camera', onPress: () => launchPicker('camera', fieldKey, location) },
            { text: '🖼️ Gallery', onPress: () => launchPicker('library', fieldKey, location) },
            { text: 'Cancel', style: 'cancel', onPress: () => isCameraOpenRef.current = false }
        ]);
    };

    const launchPicker = async (mode: 'camera' | 'library', key: string, needLoc: boolean) => {
        setLoadingImage(key);
        try {
            const picker = mode === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
            const res = await picker({ mediaTypes: ['images'], quality: 0.7, exif: true });
            if (!res.canceled && res.assets) {
                const asset = res.assets[0];
                const uri = await compressImageUri(asset.uri);
                if (needLoc) {
                    let { GPSLatitude: lat, GPSLongitude: lon } = asset.exif || {};
                    if (!lat || !lon) {
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status === 'granted') {
                            const loc = await Location.getCurrentPositionAsync({});
                            lat = loc.coords.latitude; lon = loc.coords.longitude;
                        }
                    }
                    if (lat) updateField('latitude', String(lat));
                    if (lon) updateField('longitude', String(lon));
                }
                updateField(key, { uri });
            }
        } finally { setLoadingImage(null); isCameraOpenRef.current = false; }
    };

    const handleAlertConfirm = () => {
        setAlertInfo(prev => ({ ...prev, visible: false }));
        if (alertInfo.type === 'success' && alertInfo.context === 'survey_submission') {
            setSurveyData({ user_id: user ? String(user.UserID) : '', citizenship: 'Indian', district_id: '9' });
            setCurrentStep(0); lastConfirmedStep0State.current = { licenseType: null, applicationStatus: null };
            handleDistrictChange('9');
        }
        if (alertInfo.context === 'unauthorized_access') {
            setUsers(null); setIsAuthenticated(false);
            AsyncStorage.removeItem('user').then(() => router.replace('/(auth)/login'));
        }
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        const init = async () => {
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                const u = JSON.parse(JSON.parse(stored).userDetails);
                setUser(u); updateField('user_id', String(u.UserID)); updateField('citizenship', 'Indian');
            }
            const distList = await getAllDistrictList();
            if (distList?.status === 0) setDistrict(formatDropdownData(distList.data || [], 'district_id', 'district_name'));
            handleDistrictChange('9');
        };
        init();
    }, []);

    useEffect(() => {
        const s = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
        const h = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
        return () => { s.remove(); h.remove(); };
    }, []);

    return {
        currentStep, surveyData, alertInfo, user,
        district, policeStationOptions, mouzaOptions, haatAllDetailsOptions, adsrOptions, jlNOOptions,
        blockMunicipalityOptions, wardOptions, isSaving, loadingImage, keyboardVisible,
        mobileAutofillSuccessful, isPanAutofilled, date, showPicker,
        updateField, nextStep, prevStep: () => setCurrentStep(s => s - 1),
        handleDistrictChange, handlePoliceStationChange, handleBlockTypeChange, handleBlockMunicipalityIdChange,
        processImage, handleAlertConfirm, setMobileAutofillSuccessful, setIsPanAutofilled, setShowPicker,
        setAlertInfo, isFieldVisible
    };
};
