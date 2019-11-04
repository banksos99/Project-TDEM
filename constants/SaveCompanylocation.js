import { AsyncStorage } from 'react-native';

export default class SaveCompany {

    getCompany = async () => {
        const value = await AsyncStorage.getItem('company');
        return value
    }

    setCompany(Company) {
        return AsyncStorage.setItem('company', Company)
            .then(json => {
                //console.log('success!')
            })
            .catch(error => {
                //console.log('error!')
            });
    }

}