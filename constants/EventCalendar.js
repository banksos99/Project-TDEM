import { AsyncStorage } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

import moment from 'moment'
import SharedPreference from '../SharedObject/SharedPreference';
import DeviceInfo from 'react-native-device-info';

var momentTZ = require('moment-timezone');

export default class EventCalendar {

    state = {
        calendarName: SharedPreference.CALENDAR_NAME,
        cEvents: ''
    }

    _removeEventCalendar = async () => {
        await AsyncStorage.removeItem(this.state.calendarName);
    }


    _deleteEventCalendar = async (selectYear) => {
        let array = await this.getEventIDFromDevice()
        // let currentyear = new Date().getFullYear();
        console.log("deleteEventCalendar ==> selectYear ==> ", selectYear)
        if (array != null) {
            array = JSON.parse(array)
            for (let index = 0; index < array.length; index++) {
                const eventID = array[index];
                await RNCalendarEvents.removeEvent(eventID).then(event => {
                    console.log("deleteEventCalendar ==> Success : ", eventID);
                })
                    .catch(error => {
                        console.log("deleteEventCalendar ==> Error ");
                    });
            }
        }

        try {
            let emptyUser = []
            await AsyncStorage.setItem(this.state.calendarName, JSON.stringify(emptyUser));
            let arrayTest = await this.getEventIDFromDevice()
            console.log("arrayTest ==> ", arrayTest)

        } catch (error) {
            console.log("DeleteEventCalendar ==> error ==> ", error)
        }

        await this._deleteEventFromCalendar(selectYear)
    }



    _deleteEventFromCalendar = async (selectYear) => {
        let startTime = (selectYear - 1) + '-12-30T01:01:00.000Z'
        let endTime = (selectYear + 1) + '-01-01T01:01:00.000Z'

        console.log("_deleteEventFromCalendar ==> startTime ==> ", startTime)
        console.log("_deleteEventFromCalendar ==> endTime ==> ", endTime)

        RNCalendarEvents.fetchAllEvents(startTime, endTime)
            .then(events => {
                // handle events
                console.log("_deleteEventFromCalendar ==> evnets ==> ", events.length)

                for (let index = 0; index < events.length; index++) {
                    const element = events[index];
                    console.log("_deleteEventFromCalendar delete ==> ", element)
                    console.log("_deleteEventFromCalendar ==> eventID : ", element.description)
                    let desc = element.description
                    // var checkFile = desc.indexOf("TDEM")
                    // console.log("_deleteEventFromCalendar ==> checkFile ==> ", checkFile)

                    // if (checkFile > -1) {
                    RNCalendarEvents.removeEvent(element.id).then(event => {
                        console.log("_deleteEventFromCalendar ==> Success ==> id ==> ",
                            element.id, " ==> event ==> ", event);
                    })
                        .catch(error => {
                            console.log("_deleteEventFromCalendar ==> Error ==> ", error);
                        });
                    // }
                }
            })
            .catch(error => {
                // handle error
                console.log("RNCalendarEvents ==> error ==> ", error)
            });


    }


    _addEventsToCalendar = async (eventObject, location) => {
        console.log("eventObject  : ", eventObject)

        let timeZone = DeviceInfo.getTimezone()
        console.log("timeZone  : ", timeZone)

        let format = 'YYYY-MM-DDTHH:mm:ss.sss'

        // var momentStart = momentTZ.tz(eventObject.time_start, "Asia/Bangkok").format(format);
        // var momentEnd = momentTZ.tz(eventObject.time_end, "Asia/Bangkok").format(format);
        // 2013-11-18 11:55
        // let momentStart = moment(eventObject.time_start).format();
        // let momentEnd = moment(eventObject.time_end).format();

        // let format = 'YYYY-MM-DDTHH:mm:ss.sss'

        var momentStart = momentTZ.tz(eventObject.time_start, "Asia/Bangkok").utc().format(format);
        var momentEnd = momentTZ.tz(eventObject.time_end, "Asia/Bangkok").utc().format(format);

        console.log("eventObject  momentStart : ", momentStart)
        console.log("eventObject  momentEnd : ", momentEnd)

        console.log("eventObject  momentStart : ", momentStart)
        console.log("eventObject  momentEnd : ", momentEnd)

        let alldayBool = false


        // edit 2018-09-25 by oune
        // if (eventObject.all_day == 'Y') {
        //     alldayBool = true
        // }

        title = eventObject.title
        let event = {
            startDate: momentStart + "Z",
            endDate: momentEnd + "Z",
            location: location,
            allDay: alldayBool,
            description: 'TDEM : ' + eventObject.description
        }
        console.log("Timezone ==> ", DeviceInfo.getTimezone());   //   'America/New_York'
        console.log("eventObject add caledar event : ", event)

        await RNCalendarEvents.authorizationStatus().then(fulfilled => {
            if (fulfilled !== 'authorized') {
                RNCalendarEvents.authorizeEventStore().then(fulfilled => {
                    if (fulfilled === 'authorized') {
                        RNCalendarEvents.saveEvent(title, event).then(id => {
                            this.addDataToEventID(id)
                            console.log("addEventsToCalendar ==> success ==> ID  : ", id);
                        }, error => {
                            console.log("addEventsToCalendar ==> error ==> error  : ", error);
                        }).catch(error => {
                            console.warn(error);
                        });
                    }
                });
            }
            else {
                //console.log("RNCalendarEvents ==> else")

                RNCalendarEvents.saveEvent(title, event)
                    .then(id => {
                        this.addDataToEventID(id)
                        // //console.log("addEventsToCalendar ==> ID : ", id);
                    },
                        error => {
                            // //console.log("addEventsToCalendar ==> error : ", error);
                        }).catch(error => {
                            console.warn(error);
                        });
            }


        });
    }

    addDataToEventID = async (id) => {
        //console.log("addDataToEventID ==> ", id)
        try {
            const value = await this.getEventIDFromDevice()
            ////console.log("addDataToEventID ==> value : ", value);
            if (value == null) {
                value = []
                value.push(id)
            } else {
                value = JSON.parse(value)
                value = [...value, id]; // --> [1,2,3,4]
            }
            //////console.log("=============================================")
            await AsyncStorage.setItem(this.state.calendarName, JSON.stringify(value));
            //////console.log("addData Success ============================================= : ", save)
        } catch (error) {
            //////console.log("addData Fail ============================================= : " + error);
        }
    }

    getEventIDFromDevice = async () => {
        return await AsyncStorage.getItem(this.state.calendarName);
    }

    setEventIDFromDevice(eventArray) {
        return AsyncStorage.setItem(this.state.calendarName, JSON.stringify(eventArray))
            .then(json => {
                //console.log('success!')
            })
            .catch(error => {
                //console.log('error!'))
            });
    }


    synchronizeCalendar = async (eventObject, location) => {
        try {

            console.log("synchronizeCalendar ==> eventObject ==> ", eventObject)
            console.log("synchronizeCalendar ==> location ==> ", location)

            await this._addEventsToCalendar(eventObject, location)

        } catch (e) {
            //console.log("syn/chronizeCalendar  error ", e)
        }
    }
}
