import SharedPreference from "../SharedObject/SharedPreference";

export default async function getRestAPI(username, password) {

    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
        INVALID_AUTH_TOKEN: "101",
        INVALID_API_SIGNATURE: "102",
        FAILED: "400",
        FORM_VALIDATE_FAILED: "401",
        NODATA: "404",
        TIME_OUT: "500",
        ERROR: "501",
        UPDATE_APPLICATION: "600",
        CUT_JSON: "700",
        NETWORK_ERROR: "808"

    }

    console.log("getRestAPI ===> username : ", username, " ,  password :", password)
    console.log("getRestAPI ===> SharedPreference.REGISTER_API : ", SharedPreference.REGISTER_API)
    console.log("getRestAPI ===> SharedPreference.company : ", SharedPreference.company)
    console.log("getRestAPI ===> SharedPreference.deviceInfo: ", SharedPreference.deviceInfo)



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
                code: code.NETWORK_ERROR
            }]
            return object
        });
}