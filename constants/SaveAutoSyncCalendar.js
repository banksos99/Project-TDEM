import { AsyncStorage } from 'react-native';

export default class SaveAutoSyncCalendar {

    getAutoSyncCalendar = async () => {
        var value = await AsyncStorage.getItem("statuscalendar");
        return JSON.parse(value)

    }

    setAutoSyncCalendar(calendar) {
        return AsyncStorage.setItem('statuscalendar', JSON.stringify(calendar))
            .then(json => {
                //console.log('success!')
            })
            .catch(error => {
                //console.log('error!')
            });
    }

}
