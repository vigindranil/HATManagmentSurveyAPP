import { getAuthToken } from './context/tokenManager';
import formatDateToDDMMYYYY from './utils/format';


// login

export async function authentication(username: string, password: string) {
  const url = 'http://115.187.62.16:9999/HMSRestAPI/api/auth/authentication';

  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      'http://115.187.62.16:9999/HMSRestAPI/api/user/getAllDistrictList',
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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      `http://115.187.62.16:9999/HMSRestAPI/api/user/getThanaListByDistrictID?DistrictID=${districtId}`,
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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      `http://115.187.62.16:9999/HMSRestAPI/api/user/getMouzaListByThanaID?ThanaID=${ThanaID}`,
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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      `http://115.187.62.16:9999/HMSRestAPI/api/user/getAllHaatDetailsByDistrictID?DistrictID=${DistrictID}`,
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

// export async function saveSurveyOnline(surveyData: any) {
//   try {
//     const yourTokenVariable = getAuthToken();

//     const myHeaders = new Headers();

//     myHeaders.append('Authorization', `Bearer ${yourTokenVariable}`);
//     // myHeaders.append('Content-Type','multipart/form-data');

//     const formdata = new FormData();

//     // 1. Helper function to append file if available
//     const appendFileIfExists = (fieldName: string, file: any) => {
//       if (file) {
//         formdata.append(fieldName, {
//           uri: file.uri,
//           name: file.name ,
//           type: file.type ,
//         }as any);
//       } else {
//         formdata.append(fieldName, '');
//       }
//     };

//     // 2. File/image fields

//     appendFileIfExists(
//       'residentialCertificateAttached',
//       //  surveyData.residential_certificate_attached
//       null
//     );
//     appendFileIfExists(
//       'documentImage',
//       surveyData.document_image
//       // null
//     );
//     appendFileIfExists(
//       'panImage',
//       // surveyData.panImage
//       null
//     );
//     appendFileIfExists('affidavitAttached', null); // surveyData.affidavit_attached);
//     appendFileIfExists(
//       'warisionCertificateAttached',
//       // surveyData.warision_certificate_attached
//       null
//     );
//     appendFileIfExists(
//       'deathCertificateAttached',
//       // surveyData.death_certificate_attached
//       null
//     );
//     appendFileIfExists(
//       'nocLegalHeirsAttached',
//       // surveyData.noc_legal_heirs_attached
//       null
//     );
//     appendFileIfExists('sketchMapAttached', null); // surveyData.sketch_map_attached);
//     appendFileIfExists('stallImage1', null); // surveyData.stall_image1);
//     appendFileIfExists('stallImage2', null); // surveyData.stall_image2);

//     // 3. ApplicationDetails JSON – include all required fields with fallback to ''
//     const applicationDetails = {
//       survey_id: 0,
//       license_type: parseInt(surveyData.licenseType),
//       application_status: parseInt(surveyData.applicationStatus) || 0,
//       applicant_type: parseInt(surveyData.applicationFor) || 0,
//       usage_type: parseInt(surveyData.usesType) || 0,
//       name: surveyData.name || '',
//       guardian_name: surveyData.guardian_name || '',
//       address: surveyData.address || '',
//       mobile: surveyData.mobileA || '',
//       citizenship: surveyData.citizenship || '',
//       pin_code: parseInt(surveyData.pin_code) || 0,
//       is_within_family: surveyData.is_within_family || false,
//       transfer_relationship: surveyData.transfer_relationship || '',
//       document_type: 'Aadhar',
//       pan: surveyData.pan || '',
//       previous_license_no: surveyData.previous_license_no || '',
//       license_expiry_date: surveyData.license_expiry_date || '',
//       property_tax_payment_to_year:
//         parseInt(surveyData.property_tax_payment_to_year) || 0,
//       land_transfer_explanation: surveyData.land_transfer_explanation || '',
//       occupy: surveyData.occupy || false,
//       occupy_from_year: parseInt(surveyData.occupy_from_year) || 0,
//       present_occupier_name: surveyData.present_occupier_name || '',
//       occupier_guardian_name: surveyData.occupier_guardian_name || '',
//       adsr_name: surveyData.adsr_name || '',
//       noc_legal_heirs_attached: '', // base64 not handled here, assuming as file
//       is_same_owner: surveyData.is_same_owner || false,
//       rented_to_whom: surveyData.rented_to_whom || '',
//       district_id: parseInt(surveyData.district_id) || 0,
//       police_station_id: parseInt(surveyData.police_station_id) || 0,
//       hat_id: parseInt(surveyData.hat_id) || 0,
//       mouza_id: surveyData.mouza_id || '',
//       stall_no: surveyData.stall_no || '',
//       holding_no: surveyData.holding_no || '',
//       jl_no: surveyData.jl_no || '',
//       khatian_no: surveyData.khatian_no || '',
//       plot_no: surveyData.plot_no || '',
//       area_dom_sqft: parseFloat(surveyData.area_dom_sqft) || 0.0,
//       area_com_sqft: parseFloat(surveyData.area_com_sqft) || 0.0,
//       direction: surveyData.direction || '',
//       latitude: parseFloat(surveyData.latitude) || 0.0,
//       longitude: parseFloat(surveyData.longitude) || 0.0,
//       user_id: parseInt(surveyData.user_id) || 0,
//     };

//     // 4. Append application details as JSON string
//     formdata.append('ApplicationDetails', JSON.stringify(applicationDetails));

//     console.log('formdata after append', formdata);

//     const requestOptions = {
//       method: 'POST',
//       headers: myHeaders,
//       body: formdata,
//       redirect: 'follow' as RequestRedirect,
//     };

//     const response = await fetch(
//       'http://192.168.0.216:9999/api/user/saveSurveyDetails',
//       requestOptions
//     );

//     console.log('ygbt', response);

//     if (response.status === 401) {
//       throw new Error('Unauthorized: Please login again.');
//     }

//     if (!response.ok) {
//       throw new Error(`Failed to fetch haat details: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     return data;
//   } catch (error) {
//     console.log('Error fetching haat details:', error);
//     throw error;
//   }
// }

// export async function saveSurveyOnline(surveyData: any) {
//   try {
//     const yourTokenVariable = getAuthToken();
//     const formData = new FormData();

//     // Add files
//     formData.append('documentImage', surveyData.document_image);
//     formData.append('panImage', surveyData.pan_image);

//     // For other file fields, add similar entries or leave empty for now
//     formData.append(
//       'residentialCertificateAttached',
//       surveyData.residential_certificate_attached
//     );
//     formData.append('tradeLicenseAttached', surveyData.trade_license_attached);
//     formData.append('affidavitAttached', surveyData.affidavit_attached);
//     formData.append(
//       'warisionCertificateAttached',
//       surveyData.warision_certificate_attached
//     );
//     formData.append(
//       'deathCertificateAttached',
//       surveyData.death_certificate_attached
//     );
//     formData.append(
//       'nocLegalHeirsAttached',
//       surveyData.noc_legal_heirs_attached
//     );
//     formData.append('sketchMapAttached', surveyData.sketch_map_attached);
//     formData.append('stallImage1', surveyData.stall_image1);
//     formData.append('stallImage2', surveyData.stall_image2);

//     // JSON payload as string
//     const applicationDetails = {
//       survey_id: surveyData.survey_id || 0,
//       license_type: surveyData.licenseType || 1,
//       application_status: surveyData.applicationStatus || 3,
//       applicant_type: surveyData.applicationFor || 1,
//       usage_type: surveyData.usesType || 2,
//       name: surveyData.name || '',
//       guardian_name: surveyData.guardian_name || '',
//       address: surveyData.address || '',
//       mobile: surveyData.mobile || '',
//       citizenship: surveyData.citizenship || '',
//       pin_code: surveyData.pin_code || 700001,
//       is_within_family: surveyData.is_within_family || false,
//       transfer_relationship: surveyData.transfer_relationship || '',
//       document_type: surveyData.document_type || 'Aadhar',
//       pan: surveyData.pan || '',
//       previous_license_no: surveyData.previous_license_no || '',
//       license_expiry_date: surveyData.license_expiry_date || '',
//       property_tax_payment_to_year:
//         surveyData.property_tax_payment_to_year || 2024,
//       land_transfer_explanation: surveyData.land_transfer_explanation || '',
//       occupy: surveyData.occupy || true,
//       occupy_from_year: surveyData.occupy_from_year || 2015,
//       present_occupier_name: surveyData.present_occupier_name || '',
//       occupier_guardian_name: surveyData.occupier_guardian_name || '',
//       adsr_name: surveyData.adsr_name || '',
//       noc_legal_heirs_attached: surveyData.noc_legal_heirs_attached || '',
//       is_same_owner: surveyData.is_same_owner || false,
//       rented_to_whom: surveyData.rented_to_whom || '',
//       district_id: surveyData.district_id || 4,
//       police_station_id: surveyData.police_station_id || 5,
//       hat_id: surveyData.hat_id || 4,
//       mouza_id: surveyData.mouza_id || '456',
//       stall_no: surveyData.stall_no || '102',
//       holding_no: surveyData.holding_no || '456',
//       jl_no: surveyData.jl_no || 'JL78',
//       khatian_no: surveyData.khatian_no || 'KH1122',
//       plot_no: surveyData.plot_no || 'PL55',
//       area_dom_sqft: surveyData.area_dom_sqft || 120.5,
//       area_com_sqft: surveyData.area_com_sqft || 75.3,
//       direction: surveyData.direction || 'North-East',
//       latitude: surveyData.latitude || 22.5726,
//       longitude: surveyData.longitude || 88.3639,
//       user_id: surveyData.user_id || 10,
//     };

//     formData.append('ApplicationDetails', JSON.stringify(applicationDetails));

//     const response = await fetch(
//       'http://192.168.0.216:9999/api/user/saveSurveyDetails',
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${yourTokenVariable}`,
//           'Content-Type': 'multipart/form-data',
//         },
//         body: formData,
//       }
//     );

//     const result = await response.json();
//     console.log('Response:', result);

//     return result;
//   } catch (error) {
//     console.log('Error fetching haat details:', error);
//     throw error;
//   }
// }

export async function saveSurveyOnline(surveyData: any) {
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
      area_dom_sqft: parseFloat(surveyData?.area_dom_sqft) || 0.0,
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
        exif: surveyData.document_image.exif || "",
      } as any);
    } else {
      formData.append('documentImage', "");
    }

    if (surveyData.pan_image && surveyData.pan_image.uri) {
      formData.append('panImage', {
        uri: surveyData.pan_image.uri,
        name: 'document.jpg',
        type: 'image/jpeg',
        exif: surveyData.pan_image.exif || "",
      } as any);
    } else {
      formData.append('panImage', "");
    }

    if (surveyData.residential_certificate_attached && surveyData.residential_certificate_attached.uri) {
      formData.append('residentialCertificateAttached', {
        uri: surveyData.residential_certificate_attached.uri,
        name: 'residential_certificate.jpg',
        type: 'image/jpeg',
        exif: surveyData.residential_certificate_attached.exif || "",
      } as any);
    } else {
      formData.append('residentialCertificateAttached', "");
    }

    if (surveyData.trade_license_attached && surveyData.trade_license_attached.uri) {
      formData.append('tradeLicenseAttached', {
        uri: surveyData.trade_license_attached.uri,
        name: 'trade_license.jpg',
        type: 'image/jpeg',
        exif: surveyData.trade_license_attached.exif || "",
      } as any);
    } else {
      formData.append('tradeLicenseAttached', "");
    }

    if (surveyData.affidavit_attached && surveyData.affidavit_attached.uri) {
      formData.append('affidavitAttached', {
        uri: surveyData.affidavit_attached.uri,
        name: 'affidavit.jpg',
        type: 'image/jpeg',
        exif: surveyData.affidavit_attached.exif || "",
      } as any);
    } else {
      formData.append('affidavitAttached', "");
    }

    if (surveyData.warision_certificate_attached && surveyData.warision_certificate_attached.uri) {
      formData.append('warisionCertificateAttached', {
        uri: surveyData.warision_certificate_attached.uri,
        name: 'warision_certificate.jpg',
        type: 'image/jpeg',
        exif: surveyData.warision_certificate_attached.exif || "",
      } as any);
    } else {
      formData.append('warisionCertificateAttached', "");
    }

    if (surveyData.death_certificate_attached && surveyData.death_certificate_attached.uri) {
      formData.append('deathCertificateAttached', {
        uri: surveyData.death_certificate_attached.uri,
        name: 'death_certificate.jpg',
        type: 'image/jpeg',
        exif: surveyData.death_certificate_attached.exif || "",
      } as any);
    } else {
      formData.append('deathCertificateAttached', "");
    }

    if (surveyData.noc_legal_heirs_attached && surveyData.noc_legal_heirs_attached.uri) {
      formData.append('nocLegalHeirsAttached', {
        uri: surveyData.noc_legal_heirs_attached.uri,
        name: 'noc_legal_heirs.jpg',
        type: 'image/jpeg',
        exif: surveyData.noc_legal_heirs_attached.exif || "",
      } as any);
    } else {
      formData.append('nocLegalHeirsAttached', "");
    }

    if (surveyData.sketch_map_attached && surveyData.sketch_map_attached.uri) {
      formData.append('sketchMapAttached', {
        uri: surveyData.sketch_map_attached.uri,
        name: 'sketch_map.jpg',
        type: 'image/jpeg',
        exif: surveyData.sketch_map_attached.exif || "",
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

    const response = await fetch(
        'http://192.168.0.229:9999/api/user/saveSurveyDetails',
        requestOptions
      );

    // const response = await fetch(
    //   'http://115.187.62.16:9999/HMSRestAPI/api/user/saveSurveyDetails',
    //   requestOptions
    // );

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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      `http://115.187.62.16:9999/HMSRestAPI/api/user/getDashboardCountBySurveyUserID?SurveyUserID=${SurveyUserID}`,
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
  try {
    const yourTokenVariable = getAuthToken();
    const response = await fetch(
      `http://115.187.62.16:9999/HMSRestAPI/api/user/getNumberOfStallsPerMarketID?UserID=${UserID}`,
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