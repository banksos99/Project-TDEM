import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from '../SharedObject/Authorization'

export default async function getRestAPI(pin, functionID) {

    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
        INVUSER_NO_ROLE: "101",
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
    }
    // console.log("setPinAPI ==> URL  : ", SharedPreference.SET_PIN_API)
    //console.log("setPinAPI ==>  functionID : ", functionID)
    FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    // console.log("setPinAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

    return fetch(SharedPreference.SET_PIN_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: FUNCTION_TOKEN,
        },
        body: JSON.stringify({
            "type": "set",
            "client_pin": pin,
            "systemdn": SharedPreference.company,
            application_device: SharedPreference.APPLICATION_DEVICE // Watchara N, at 16August2019
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log("callback success22222 : ", responseJson)
            let object
            if (responseJson.status == code.SUCCESS) {
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.data
                }]
            } else {
                console.log("responseJson.errors : ", responseJson.errors)
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.errors[0]
                }]
            }
            return object

        })
        .catch((error) => {
            //console.log("callback error : ", error)
        });

}