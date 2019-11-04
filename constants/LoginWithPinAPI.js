import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function loginWithPinAPI(pin, functionID) {

   let code = {
       SUCCESS: "200",
       INVALID_USER_PASS: "101",
       FAILED: "400",
       DOES_NOT_EXISTS: "401",
       INVALID_AUTH_TOKEN: "403",
       NODATA: "404",
       DUPLICATE_DATA: "409",
       USER_LOCK_: "423",
       TIME_OUT: "500",
       INTERNAL_SERVER_ERROR: "500",
       ERROR: "501",
       UPDATE_APPLICATION: "600",
       CUT_JSON: "700",
       NETWORK_ERROR: "800"
   }

   if (SharedPreference.profileObject) {

       let FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)

       console.log("PIN SharedPreference.company : => ",SharedPreference.company)

       return fetch(SharedPreference.REGISTER_API, {
           method: 'POST',
           headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache, no-store, must-revalidate',
               'Pragma': 'no-cache',
               'Expires': 0,
               Authorization: FUNCTION_TOKEN
           },
           body: JSON.stringify({
               grant_type: "pinsignin",
               client_pin: pin,
               firebase_token: SharedPreference.deviceInfo.firebaseToken,
               systemdn: SharedPreference.company,

               device_model: SharedPreference.deviceInfo.deviceModel,
               device_brand: SharedPreference.deviceInfo.deviceBrand,
               device_os: SharedPreference.deviceInfo.deviceOS,
               device_os_version: SharedPreference.deviceInfo.deviceOSVersion,
               app_version: SharedPreference.deviceInfo.appVersion,
               application_device: SharedPreference.APPLICATION_DEVICE // Watchara N, at 16August2019
           }),
       })
           .then((response) => response.json())
           .then((responseJson) => {
            
               let object
               if (responseJson.status == code.SUCCESS) {
                   SharedPreference.profileObject = responseJson.data
                   object = [code, {
                       code: responseJson.status,
                       data: responseJson.data
                   }]
               } else if (responseJson.status == code.INVALID_USER_PASS) {
                   statusText = responseJson.errors[0]
                   object = [code, {
                       code: responseJson.status,
                       data: statusText
                   }]
               } else {
                   object = [code, {
                       code: responseJson.status,
                       data: responseJson.errors[0]
                   }]
               }
               return object
           })
           .catch((error) => {
               object = [code, {
                   code: code.NETWORK_ERROR,
                   data: error
               }]
               return object
           });
   }
}

