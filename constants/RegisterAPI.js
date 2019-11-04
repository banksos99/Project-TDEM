import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function getRestAPI(username, password) {

    let code = {
        SUCCESS: "200",
        INVALID_USER_PASS: "101",
        FAILED: "400",
        DOES_NOT_EXISTS: "401",
        INVALID_AUTH_TOKEN: "403",
        NODATA: "404",
        DUPLICATE_DATA: "409",
        TIME_OUT: "500",
        INTERNAL_SERVER_ERROR: "500",
        ERROR: "501",
        UPDATE_APPLICATION: "600",
        CUT_JSON: "700",
        NETWORK_ERROR: "800"
    }
    console.log("REGISTER_API : => ",SharedPreference.REGISTER_API)
    console.log("username : => ",username)
    console.log("password : => ",password)
    console.log("device_model : => ",SharedPreference.deviceInfo.deviceModel)
    console.log("deviceBrand : => ",SharedPreference.deviceInfo.deviceBrand)
    console.log("deviceOS : => ",SharedPreference.deviceInfo.deviceOS)
    console.log("deviceOSVersion : => ",SharedPreference.deviceInfo.deviceOSVersion)
    console.log("firebaseToken : => ",SharedPreference.deviceInfo.firebaseToken)
    console.log("appVersion : => ",SharedPreference.deviceInfo.appVersion)
    console.log("company : => ",SharedPreference.company)

    return fetch(SharedPreference.REGISTER_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0,
        },
        body: JSON.stringify({
            grant_type: "register",
            systemdn: SharedPreference.company,
            username: username,
            password: password,
            device_model: SharedPreference.deviceInfo.deviceModel,
            device_brand: SharedPreference.deviceInfo.deviceBrand,
            device_os: SharedPreference.deviceInfo.deviceOS,
            device_os_version: SharedPreference.deviceInfo.deviceOSVersion,
            firebase_token: SharedPreference.deviceInfo.firebaseToken,
            app_version: SharedPreference.deviceInfo.appVersion,
            application_device: SharedPreference.APPLICATION_DEVICE
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
            } else if ((responseJson.status == code.INVALID_USER_PASS)||(responseJson.status == code.FAILED)) {
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
                data: "Cannot connect Network"
            }]
            return object
        });
}