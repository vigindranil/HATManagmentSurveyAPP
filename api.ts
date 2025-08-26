import { getAuthToken } from './context/tokenManager';
import formatDateToDDMMYYYY from './utils/format';


// login

export async function authentication(username: string, password: string) {
  // const url = `http://115.187.62.16:9999/HMSRestAPI/api/auth/authentication`;
  const url = `${process.env.EXPO_PUBLIC_API_URL_AUTH}`;

  console.log("🔍 API URL AUTH:", process.env.EXPO_PUBLIC_API_URL_AUTH);
  console.log("🔍 Full URL:", url);

  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append("Accept", "application/json");
   

    const raw = JSON.stringify({
      username: username,
      password: password,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions);

    console.log('Login API response:', response);

    if (response.status === 401) {
      return {
        status: 401,
        message: 'Unauthorized: Invalid username or password.',
      };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log('Error generating token:', error.message);
    throw error;
  }
}

export async function getAllDistrictList() {

  // const url =  'http://115.187.62.16:9999/HMSRestAPI/api/user/getAllDistrictList'
   const url =  `${process.env.EXPO_PUBLIC_BASE_URL}/getAllDistrictList`
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
     url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching district list:', error.message);
    throw error;
  }
}

export async function getPoliceStationsByDistrictId(
  districtId: string | number
) {

   const url =`${process.env.EXPO_PUBLIC_BASE_URL}/getThanaListByDistrictID?DistrictID=${districtId}`



  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log('Error fetching police station list:', error.message);
    throw error;
  }
}

export async function getMouzaListByThanaID(ThanaID: string | number) {

   const url =`${process.env.EXPO_PUBLIC_BASE_URL}/getMouzaListByThanaID?ThanaID=${ThanaID}`
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
     url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log('Error fetching mouza list:', error.message);
    throw error;
  }
}

export async function getAllHaatDetailsByDistrictID(
  DistrictID: string | number
) {


   const url =`${process.env.EXPO_PUBLIC_BASE_URL}/getAllHaatDetailsByDistrictID?DistrictID=${DistrictID}`
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching haat details:', error.message);
    throw error;
  }
}


export async function saveSurveyOnline(surveyData: any) {

  const url =`${process.env.EXPO_PUBLIC_BASE_URL}/saveSurveyDetails`
  // const url =`http://192.168.0.235:9991/api/user/saveSurveyDetails`

  console.log(url);


  try {

    const yourTokenVariable = getAuthToken();
    const myHeaders = new Headers();

    myHeaders.append('Authorization', `Bearer ${yourTokenVariable}`);
    // Do not set Content-Type header when sending FormData; let the browser set it automatically.

    console.log("surveyData", surveyData);

    const formData = new FormData();

    formData.append("applicationDetials", JSON.stringify( {
      survey_id: 0,
      license_type: parseInt(surveyData?.licenseType) || 0,
      application_status: parseInt(surveyData?.applicationStatus) || 0,
      applicant_type: parseInt(surveyData?.applicationFor) || 0,
      usage_type: parseInt(surveyData?.usesType) || 0,
      name: surveyData?.name || "",
      guardian_name: surveyData?.guardian_name || "",
      address: surveyData?.address || "",
      mobile: surveyData?.mobile || "",
      citizenship: surveyData?.citizenship || "",
      pin_code: parseInt(surveyData?.pin_code) || 0,
      is_within_family: surveyData?.is_within_family || false,
      transfer_relationship: surveyData?.transfer_relationship || "",
      document_type: surveyData?.documentTypes || "",
      pan: surveyData?.pan || "",
      previous_license_no: surveyData?.previous_license_no || "",
      license_expiry_date: formatDateToDDMMYYYY(surveyData?.license_expiry_date) || "",
      property_tax_payment_to_year: parseInt(surveyData?.property_tax_payment_to_year) || 0,
      land_transfer_explanation: surveyData?.land_transfer_explanation || "",
      occupy: surveyData?.occupy || false,
      occupy_from_year: parseInt(surveyData?.occupy_from_year) || 0,
      present_occupier_name: surveyData?.present_occupier_name || "",
      occupier_guardian_name: surveyData?.occupier_guardian_name || "",
      adsr_name: surveyData?.adsr_name || "",
      is_same_owner: surveyData?.is_same_owner || false,
      rented_to_whom: surveyData?.rented_to_whom || "",
      district_id: parseInt(surveyData?.district_id) || 0,
      police_station_id: parseInt(surveyData?.police_station_id) || 0,
      hat_id: parseInt(surveyData?.hat_id) || 0,
      mouza_id: surveyData?.mouza_id || "",
      stall_no: surveyData?.stall_no || "",
      holding_no: surveyData?.holding_no || "",
      jl_no: surveyData?.jl_no || "",
      khatian_no: surveyData?.khatian_no || "",
      plot_no: surveyData?.plot_no || "",
      // area_dom_sqft: parseFloat(surveyData?.area_dom_sqft) || 0.0,
      area_com_sqft: parseFloat(surveyData?.area_com_sqft) || 0.0,
      direction: surveyData?.direction || "",
      latitude: parseFloat(surveyData?.latitude) || 0.0,
      longitude: parseFloat(surveyData?.longitude) || 0.0,
      land_valuation_amount : parseFloat(surveyData?.land_valuation_amount) || 0.0,
      user_id: parseInt(surveyData?.user_id) || 0,
      remarks : surveyData.remarks || "",
    }));

    if (surveyData.document_image && surveyData.document_image.uri) {
      formData.append('documentImage', {
        uri: surveyData.document_image.uri,
        name: 'document.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('documentImage', "");
    }

    if (surveyData.pan_image && surveyData.pan_image.uri) {
      formData.append('panImage', {
        uri: surveyData.pan_image.uri,
        name: 'document.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('panImage', "");
    }

    if (surveyData.residential_certificate_attached && surveyData.residential_certificate_attached.uri) {
      formData.append('residentialCertificateAttached', {
        uri: surveyData.residential_certificate_attached.uri,
        name: 'residential_certificate.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('residentialCertificateAttached', "");
    }

    if (surveyData.trade_license_attached && surveyData.trade_license_attached.uri) {
      formData.append('tradeLicenseAttached', {
        uri: surveyData.trade_license_attached.uri,
        name: 'trade_license.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('tradeLicenseAttached', "");
    }

    if (surveyData.affidavit_attached && surveyData.affidavit_attached.uri) {
      formData.append('affidavitAttached', {
        uri: surveyData.affidavit_attached.uri,
        name: 'affidavit.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('affidavitAttached', "");
    }

    if (surveyData.warision_certificate_attached && surveyData.warision_certificate_attached.uri) {
      formData.append('warisionCertificateAttached', {
        uri: surveyData.warision_certificate_attached.uri,
        name: 'warision_certificate.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('warisionCertificateAttached', "");
    }

    if (surveyData.death_certificate_attached && surveyData.death_certificate_attached.uri) {
      formData.append('deathCertificateAttached', {
        uri: surveyData.death_certificate_attached.uri,
        name: 'death_certificate.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('deathCertificateAttached', "");
    }

    if (surveyData.noc_legal_heirs_attached && surveyData.noc_legal_heirs_attached.uri) {
      formData.append('nocLegalHeirsAttached', {
        uri: surveyData.noc_legal_heirs_attached.uri,
        name: 'noc_legal_heirs.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('nocLegalHeirsAttached', "");
    }

    if (surveyData.sketch_map_attached && surveyData.sketch_map_attached.uri) {
      formData.append('sketchMapAttached', {
        uri: surveyData.sketch_map_attached.uri,
        name: 'sketch_map.jpg',
        type: 'image/jpeg',
       
      } as any);
    } else {
      formData.append('sketchMapAttached', "");
    }

    if (surveyData.stall_image1 && surveyData.stall_image1.uri) {
      formData.append('stallImage1', {
        uri: surveyData.stall_image1.uri,
        name: 'stall_image1.jpg',
        type: 'image/jpeg',
        exif: surveyData.stall_image1.exif || "",
      } as any);
    } else {
      formData.append('stallImage1', "");
    }

    if (surveyData.stall_image2 && surveyData.stall_image2.uri) {
      formData.append('stallImage2', {
        uri: surveyData.stall_image2.uri,
        name: 'stall_image2.jpg',
        type: 'image/jpeg',
        exif: surveyData.stall_image2.exif || "",
      } as any);
    } else {
      formData.append('stallImage2', "");
    }

    if (surveyData.land_valuation_document && surveyData.land_valuation_document.uri) {
      formData.append('landValuationDoc', {
        uri: surveyData.land_valuation_document.uri,
        name: 'land_valuation_document.jpg',
        type: 'image/jpeg',
        exif: surveyData.land_valuation_document.exif || "",
      } as any);
    } else {
      formData.append('landValuationDoc', "");
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
      redirect: 'follow' as RequestRedirect,
    };

    // const response = await fetch(
    //     'http://192.168.0.229:9999/api/user/saveSurveyDetails',
    //     requestOptions
    //   );

    const response = await fetch(
      url,
      requestOptions
    );

    console.log("response", response);

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();

    console.log("data",data);

    return data;
  } catch (error) {
    console.log('Error fetching haat details:', error.message);
    throw error;
  }
} 


export async function getDashboardCountBySurveyUserID(
  SurveyUserID: string | number
) {


   const url =`${process.env.EXPO_PUBLIC_BASE_URL}/getDashboardCountBySurveyUserID?SurveyUserID=${SurveyUserID}`
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching haat details:', error.message);
    throw error;
  }
}

export async function getNumberOfStallsPerMarketID(
  UserID: string | number
) {



   const url =`${process.env.EXPO_PUBLIC_BASE_URL}/getNumberOfStallsPerMarketID?UserID=${UserID}`
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${yourTokenVariable}`,
        },
      }
    );

    if (response.status === 401) {
      throw { status: 401, message: 'Unauthorized: Please login again.' };
    }

    if (!response.ok) {
      throw { status: response.status, message: "API Error" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching haat details:', error.message);
    throw error;
  }
}