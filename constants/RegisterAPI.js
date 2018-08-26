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

    // //console.log("getRestAPI ===> username : ", username, " ,  password :", password)
    // //console.log("getRestAPI ===> SharedPreference.REGISTER_API : ", SharedPreference.REGISTER_API)
    // //console.log("getRestAPI ===> SharedPreference.company : ", SharedPreference.company)
    // //console.log("getRestAPI ===> SharedPreference.deviceInfo: ", SharedPreference.deviceInfo)

    return fetch(SharedPreference.REGISTER_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
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
            app_version: SharedPreference.deviceInfo.appVersion
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log("RegisterAPI ==> callback  success : ", responseJson)
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
                    data: responseJson.data
                }]
            }
            return object

        })
        .catch((error) => {
            console.log("callback error : ", error)
            object = [code, {
                code: code.NETWORK_ERROR,
                data: "Cannot connect Network"
            }]
            return object
        });
}