var base64 = require('base-64');

var Authorization = {
    convert(empID, funcID, clientToken) {
        code = empID + "." + funcID + "." + clientToken
        // //console.log("Authorization code ==> : ", code);
        //let encodedString = btoa(code);
        let encodedString = base64.encode(code);
        // //console.log("Authorization ==> : ", encodedString);
        let authorization = "Bearer " + encodedString
        // //console.log("Authorization authorization ==> : ", authorization);
        return authorization
    }
};

module.exports = Authorization;