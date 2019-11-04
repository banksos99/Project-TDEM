import { AsyncStorage } from 'react-native';

export default class SaveTOKEN {

    getToken = async () => {
        // return await AsyncStorage.getItem('pin');
        const value = await AsyncStorage.getItem('token');
        //console.log("SavePIN getPin ========> ", value)
        return value
    }

    setToken(Token) {
        return AsyncStorage.setItem('token', Token)
            .then(json => {
                //console.log('success!')
            })
            .catch(error => { //console.log('error!')
            });
    }

}
