import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function getPDF(year, company,functionID) {
    let code = {
        SUCCESS: "200",
        INVALID_API_KEY: "100",
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

    FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    let url = SharedPreference.CALENDER_YEAR_PDF_API + year + "&company=" + company
    console.log("callback success url : ", url)

    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: FUNCTION_TOKEN,
        },
    })
        .then((response) => response.json())
        .then((responseJson) => {
            // //console.log("callback success : ", responseJson.status)
            let object
            if (responseJson.status == code.SUCCESS) {
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.data
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
            return [code, {
                code: code.ERROR,
                data: error
            }]
        });
}