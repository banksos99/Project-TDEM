import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function changePin(oldPin, newPin, functionID) {

    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
        INVALID_API_SIGNATURE: "102",
        FAILED: "400",
        DOES_NOT_EXISTS: "401",
        INVALID_AUTH_TOKEN: "403",
        INVALID_DATA: "404",
        DUPLICATE_DATA: "409",
        TIME_OUT: "500",
        INTERNAL_SERVER_ERROR: "500",
        ERROR: "501",
        UPDATE_APPLICATION: "600",
        CUT_JSON: "700",
    }

    FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    // console.log("changePin ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)
    // console.log("changePin ==> oldPin  : ", oldPin)
    // console.log("changePin ==> newPin  : ", newPin)

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
            // console.log("changePin ==> callback success : ", responseJson)
            let object
            if (responseJson.status == code.SUCCESS) {
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.data
                }]
            } else if (responseJson.status == code.INVALID_DATA) {
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
            // //console.log("changePin ==> callback object : ", JSON.stringify(object))
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