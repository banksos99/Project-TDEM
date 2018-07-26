import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function changePin(oldPin, newPin,functionID) {

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

     // console.log("calendarPDFAPI ==>  functionID : ", functionID)
     FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
     console.log("calendarPDFAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

    return fetch(SharedPreference.SET_PIN_API, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: FUNCTION_TOKEN
        },
        body: JSON.stringify({
            type: "change",
            client_pin: newPin,
            systemdn: "TMAP-EM",
            client_oldpin: oldPin
        }),
    })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log("changePin ==> callback success : ", responseJson)
            let object
            if (responseJson.status == code.SUCCESS) {
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
            // console.log("changePin ==> callback object : ", JSON.stringify(object))
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