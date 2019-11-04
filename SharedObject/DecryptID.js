var aesjs = require('aes-js');
var sha512 = require('js-sha512').sha512;
var base64 = require('base-64');

import SharedPreference from "./../SharedObject/SharedPreference"


var Decrypt = {

    decrypt(enc64) {
        //console.log("enc64 : ", enc64)
        if (enc64) {

            try {

                let secretkey = sha512.digest(SharedPreference.profileObject.client_secret).slice(0, 16);
                // console.log("secretkey : ",SharedPreference.profileObject.client_secret, sha512.digest(SharedPreference.profileObject.client_secret),secretkey)
                let enc = base64.decode(base64.decode(enc64));

                var target = [];
                for (let i = 0; i < enc.length; i++) {
                    target.push(enc.charCodeAt(i))
                }
                var aesEcb = new aesjs.ModeOfOperation.ecb(secretkey);
                var decryptedBytes = aesEcb.decrypt(target);
                var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
                var result = decryptedText.split('.')[0];
                // let numberstr = base64.decode(result).split('.');
                // let resouce = parseInt(numberstr[0]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + numberstr[1];
                return base64.decode(result)
            } catch (error) {
                return ''
            }

        } else {
            return '';
        }

    }

};

module.exports = Decrypt;