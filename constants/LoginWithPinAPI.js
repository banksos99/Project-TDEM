import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";
 
export default async function getRestAPI(pin, functionID) {

    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
        INVALID_AUTH_TOKEN: "101",
        INVALID_API_SIGNATURE: "102",
        FAILED: "400",
        DOES_NOT_EXISTS: "401",
        NODATA: "404",
        DUPLICATE_DATA: "409",
        TIME_OUT: "500",
        ERROR: "501",
        UPDATE_APPLICATION: "600",
        CUT_JSON: "700",
    }

    console.log("LoginWithPin ==> pin  : ", pin, " , functionID : ", functionID)
    // console.log("LoginWithPin ==> callback  Register  : ", SharedPreference.REGISTER_API)
    // console.log("LoginWithPin ==> callback  client_pin  : ", pin)
    // console.log("LoginWithPin ==> callback  firebase_token  : ", SharedPreference.deviceInfo.firebaseToken)
    // console.log("LoginWithPin ==> callback  systemdn  : ", SharedPreference.company)
    let FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    console.log("LoginWithPin ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

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
            console.log("LoginWithPinAPI ==> callback success : ", responseJson)
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
            object = [code, {
                code: code.ERROR,
                data: error
            }]
            return object
        });
}