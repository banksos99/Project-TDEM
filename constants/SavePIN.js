import { AsyncStorage } from 'react-native';

export default class SavePIN {

    getPin = async () => {
        const value = await AsyncStorage.getItem('pin');
        return value
    }

    setPin(PIN) {
        return AsyncStorage.setItem('pin', PIN)
            .then(json => {
                //console.log('success!')
            })
            .catch(error => {
                //console.log('error!')
            });
    }

}
