import { AsyncStorage } from 'react-native';

export default class SaveProfile {
    getProfile = async () => {
        const value = await AsyncStorage.getItem('profile');
        //console.log("getProfile  ========> ", value)
        return JSON.parse(value)
    }
    setProfile = async (profileObject) => {
        console.log("setProfile  ========> ", profileObject)
        return await AsyncStorage.setItem('profile', JSON.stringify(profileObject));
    }
}
