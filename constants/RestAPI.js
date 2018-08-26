import SharedPreference from "../SharedObject/SharedPreference";
import Authorization from "../SharedObject/Authorization";

export default async function getRestAPI(url, functionID) {

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

    // //console.log("RestAPI ==>  url : ", url)
    // //console.log("RestAPI ==>  functionID : ", functionID)
    if(functionID == null){
        functionID = 1
    }
    
    console.log("RestAPI ==> getRestAPI  : ", url)
    FUNCTION_TOKEN =  Authorization.convert(SharedPreference.profileObject.client_id, functionID, SharedPreference.profileObject.client_token)
    console.log("RestAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN,SharedPreference.profileObject.employee_id)

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
            console.log("RestAPI success : ", responseJson.status)
            let object
            if (responseJson.status == code.SUCCESS) {
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.data
                }]
            } else {
                object = [code, {
                    code: responseJson.status,
                    data: responseJson.errors
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