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
        TIME_OUT: "500",
        INTERNAL_SERVER_ERROR: "500",
        ERROR: "501",
        UPDATE_APPLICATION: "600",
        CUT_JSON: "700",
        NETWORK_ERROR: "800"
    }

    console.log("LoginWithPin ==> url  : ",SharedPreference.REGISTER_API)
    // console.log("LoginWithPin ==> pin  : ", pin, " , functionID : ", functionID)
    let FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    // console.log("LoginWithPin ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

    return fetch(SharedPreference.REGISTER_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: FUNCTION_TOKEN
        },
        body: JSON.stringify({
            grant_type: "pinsignin",
            client_pin: pin,
            firebase_token: SharedPreference.deviceInfo.firebaseToken,
            systemdn: SharedPreference.company
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log("SharedPreference.REGISTER_API ==>  : ", SharedPreference.REGISTER_API)
            let object
            if (responseJson.status == code.SUCCESS) {
                SharedPreference.profileObject = responseJson.data
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.data
                }]
            } else if (responseJson.status == code.INVALID_USER_PASS) {
                statusText = responseJson.errors[0]
                // console.log("statusText ==> ",statusText)
                // console.log("statusText ==> code ==> ",statusText.code)
                // console.log("statusText ==> detail ==> ",statusText.detail)

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
            object = [code, {
                code: code.NETWORK_ERROR,
                data: error
            }]
            return object
        });
}