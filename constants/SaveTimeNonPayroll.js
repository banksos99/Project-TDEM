import { AsyncStorage } from 'react-native';

export default class SaveTimeNonPayroll {

    getTimeStamp = async () => {
        const value = await AsyncStorage.getItem('time');
        return value
    }

    setTimeStamp(time) {
        return AsyncStorage.setItem('time', time)
            .then(json => {
                //console.log('success!')
            })
            .catch(error => {
                //console.log('error!')
            });
    }
}
