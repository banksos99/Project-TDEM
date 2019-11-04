import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from '../SharedObject/Authorization'

export default async function signOutAPI(functionID) {

    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
        INVALID_USER_PASS: "101",
        INVALID_API_SIGNATURE: "102",
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
    // console.log("signOutAPI ==> ", SharedPreference.profileObject)
    // console.log("signOutAPI ==> client_id ==> ", SharedPreference.profileObject.client_id)
    // console.log("signOutAPI ==> functionID ==> ", functionID)
    // console.log("signOutAPI ==> client_token ==> ", SharedPreference.profileObject.client_token)

    FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    // console.log("signOutAPI FUNCTION_TOKEN ==> ", FUNCTION_TOKEN)

    return fetch(SharedPreference.REGISTER_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: FUNCTION_TOKEN,
        },
        body: JSON.stringify({
            "grant_type": "signout",
            "systemdn": "TDEM-EM"
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
            // console.log("signOutAPI ==> responseJson ==> ", responseJson)
            let object
            if (responseJson.status == code.SUCCESS) {
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
                    data: responseJson.error
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