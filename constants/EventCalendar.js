import { AsyncStorage,Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

import moment from 'moment'
import SharedPreference from '../SharedObject/SharedPreference';
import DeviceInfo from 'react-native-device-info';

var momentTZ = require('moment-timezone');
let  listIDEventAdder = [];

export default class EventCalendar {

    state = {
        calendarName: SharedPreference.CALENDAR_NAME,
        cEvents: '',
       
    }

    _removeEventCalendar = async () => {
        await AsyncStorage.removeItem(this.state.calendarName);
    }


    _deleteEventCalendar = async (selectYear) => {
        let array = await this.getEventIDFromDevice()
        let currentyear = new Date().getFullYear();
        console.log("deleteEventCalendar ==> selectYear ==> ", selectYear,array)
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
            // await AsyncStorage.setItem(this.state.calendarName, JSON.stringify(emptyUser));
            let arrayTest = await this.getEventIDFromDevice()
            // console.log("arrayTest ==> ", arrayTest)

        } catch (error) {
            // console.log("DeleteEventCalendar ==> error ==> ", error)
        }

        await this._deleteEventFromCalendar(selectYear)//oune
        // await this._deleteAllEvent(selectYear)

    }

    _deleteAllEvent = async (selectYear) => {
        let startTime = (selectYear - 1) + '-12-30T01:01:00.000Z'
        let endTime = (selectYear + 1) + '-01-01T01:01:00.000Z'

        // console.log("deleteEventFromCalendar ==> startTime ==> ", startTime)
        // console.log("deleteEventFromCalendar ==> endTime ==> ", endTime)

        RNCalendarEvents.fetchAllEvents(startTime, endTime)
            .then(events => {
                // handle events
                // console.log("deleteEventFromCalendar ==> evnets ==> ", events.length)

                for (let index = 0; index < events.length; index++) {
                    const element = events[index];
                    // console.log("deleteEventFromCalendar delete ==> ", element)
                    // console.log("deleteEventFromCalendar ==> eventID : ", element.description)
                    let desc = element.description
                    // var checkFile = desc.indexOf("TDEM")
                    // console.log("deleteEventFromCalendar ==> checkFile ==> ", checkFile)

                    // if (checkFile > -1) {
                    RNCalendarEvents.removeEvent(element.id).then(event => {
                        console.log("deleteEventFromCalendar ==> Success ==> id ==> ",
                            element.id, " ==> event ==> ", event);
                    })
                        .catch(error => {
                            // console.log("deleteEventFromCalendar ==> Error ==> ", error);
                        });
                    // }
                }
            })
            .catch(error => {
                // handle error
                // console.log("RNCalendarEvents ==> error ==> ", error)
            });

    }


    _deleteEventFromCalendar = async (selectYear) => {

        let array = await this.getEventIDFromDevice()

        if (array) {

            // console.log('_onSyncCalendarEvent array => ', array)
            // console.log('_onSyncCalendarEvent array => ', array.length)
            for (let index = 0; index < array.length; index++) {
                const eventID = array[index];
                // console.log("1 deleteEventCalendar ==> Success : ", array[index]);
                await RNCalendarEvents.removeEvent(eventID).then(event => {
                    console.log("2 deleteEventCalendar ==> Success : ", eventID);
                })
                    .catch(error => {
                        console.log("deleteEventCalendar ==> Error ");
                    });
            }
        }

        listIDEventAdder = [];

        this.setEventIDFromDevice(listIDEventAdder)

        // for (let index = 0; index < array.length; index++) {
        //     RNCalendarEvents.removeEvent(array[index]).then(event => {
        //         const element = array[index];
        //         // console.log("deleteEventFromCalendar ==> Success ==> id ==> ",
        //             // element.id, " ==> event ==> ", event);
        //     })
        //         .catch(error => {
        //             // console.log("deleteEventFromCalendar ==> Error ==> ", error);
        //         });
        // }


        // let startTime = (selectYear - 1) + '-12-30T01:01:00.000Z'
        // let endTime = (selectYear + 1) + '-01-01T01:01:00.000Z'

        // console.log("_deleteEventFromCalendar ==> startTime ==> ", startTime)
        // console.log("_deleteEventFromCalendar ==> endTime ==> ", endTime)

        // RNCalendarEvents.fetchAllEvents(startTime, endTime)
        //     .then(events => {
        //         // handle events
        //         console.log("_deleteEventFromCalendar ==> evnets ==> ", events.length)

        //         for (let index = 0; index < events.length; index++) {
        //             const element = events[index];
        //             console.log("_deleteEventFromCalendar delete ==> ", element)
        //             console.log("_deleteEventFromCalendar ==> eventID : ", element.description)
        //             let desc = element.description
        //             // var checkFile = desc.indexOf("TDEM")
        //             // console.log("_deleteEventFromCalendar ==> checkFile ==> ", checkFile)

        //             // if (checkFile > -1) {
        //             RNCalendarEvents.removeEvent(element.id).then(event => {
        //                 console.log("_deleteEventFromCalendar ==> Success ==> id ==> ",
        //                     element.id, " ==> event ==> ", event);
        //             })
        //                 .catch(error => {
        //                     console.log("_deleteEventFromCalendar ==> Error ==> ", error);
        //                 });
        //             // }
        //         }
        //     })
        //     .catch(error => {
        //         // handle error
        //         console.log("RNCalendarEvents ==> error ==> ", error)
        //     });


    }


    _addEventsToCalendar = async (eventObject, location) => {
        // console.log("eventObject  : ", eventObject)

        let timeZone = DeviceInfo.getTimezone()
        // console.log("timeZone  : ", timeZone)

        let format = 'YYYY-MM-DDTHH:mm:ss.sss'

        // var momentStart = momentTZ.tz(eventObject.time_start, "Asia/Bangkok").format(format);
        // var momentEnd = momentTZ.tz(eventObject.time_end, "Asia/Bangkok").format(format);
        // 2013-11-18 11:55
        // let momentStart = moment(eventObject.time_start).format();
        // let momentEnd = moment(eventObject.time_end).format();

        // let format = 'YYYY-MM-DDTHH:mm:ss.sss'

        var momentStart = momentTZ.tz(eventObject.time_start, "Asia/Bangkok").utc().format(format);
        var momentEnd = momentTZ.tz(eventObject.time_end, "Asia/Bangkok").utc().format(format);

        // console.log("eventObject  momentStart : ", momentStart)
        // console.log("eventObject  momentEnd : ", momentEnd)

        // console.log("eventObject  momentStart : ", momentStart)
        // console.log("eventObject  momentEnd : ", momentEnd)

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
        // console.log("Timezone ==> ", DeviceInfo.getTimezone());   //   'America/New_York'
        // console.log("eventObject add caledar event : ", event)

        await RNCalendarEvents.authorizationStatus().then(fulfilled => {
            if (fulfilled !== 'authorized') {
                RNCalendarEvents.authorizeEventStore().then(fulfilled => {
                    if (fulfilled === 'authorized') {
                        RNCalendarEvents.saveEvent(title, event).then(id => {
                            listIDEventAdder.push(id)
                            console.log('listIDEventAdder => ',this.state.listIDEventAdder)
                            this.setEventIDFromDevice(listIDEventAdder)
                            
                            // this.addDataToEventID(id)
                            // console.log("1addEventsToCalendar ==> success ==> ID  : ", id);
                        }, error => {
                            // console.log("1addEventsToCalendar ==> error ==> error  : ", error);
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
                        
                          
                        // this.addDataToEventID(id)
                        listIDEventAdder.push(id)
                        console.log("2addEventsToCalendar ==> success ==> ID  : ", id,' =>',listIDEventAdder);
                        this.setEventIDFromDevice(listIDEventAdder)
               
                    },
                    error => {
                        console.log("2addEventsToCalendar ==> error ==> error  : ", error);
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
            console.log("addDataToEventID ==> value : ", value);
            if (value == null) {
                value = []
                value.push(id)
            } else {
                value = JSON.parse(value)
                value = [...value, id]; // --> [1,2,3,4]
            }
            //////console.log("=============================================")

            // await AsyncStorage.setItem(this.state.calendarName, JSON.stringify(value));



            //////console.log("addData Success ============================================= : ", save)
        } catch (error) {
            //////console.log("addData Fail ============================================= : " + error);
        }
    }

    getEventIDFromDevice(){
        // return await AsyncStorage.getItem(this.state.calendarName);

        return AsyncStorage.getItem(this.state.calendarName)
        .then(json => {
            return JSON.parse(json);
        })
        .catch(error => { console.log('Load Highlights failed! ' + error)
            let value =  JSON.parse("{}");
            return value;
        });

    }

    setEventIDFromDevice(eventArray) {
        return AsyncStorage.setItem(this.state.calendarName, JSON.stringify(eventArray))
            .then(json => {
                console.log('AsyncStorage.setItem success!')
            })
            .catch(error => {
                //console.log('error!'))
            });
    }

    synchronizeCalendar = async (eventObject, location) => {



        try {

            // console.log("synchronizeCalendar ==> eventObject ==> ", eventObject)
            // console.log("synchronizeCalendar ==> location ==> ", location)

            await this._addEventsToCalendar(eventObject, location)

        } catch (e) {
            //console.log("syn/chronizeCalendar  error ", e)
        }
    }

    _onSyncCalendarEvent = async(holidayArray,location)=>{
        console.log('_onSyncCalendarEvent')
        let array = await this.getEventIDFromDevice()

        if (array) {

            console.log('_onSyncCalendarEvent array => ', array)
            console.log('_onSyncCalendarEvent array => ', array.length)
            for (let index = 0; index < array.length; index++) {
                const eventID = array[index];
                // console.log("1 deleteEventCalendar ==> Success : ", array[index]);
                await RNCalendarEvents.removeEvent(eventID).then(event => {
                    console.log("2 deleteEventCalendar ==> Success : ", eventID);
                })
                    .catch(error => {
                        console.log("deleteEventCalendar ==> Error ");
                    });
            }
        }

        listIDEventAdder = [];

        this.setEventIDFromDevice(listIDEventAdder)

        for (let index = 0; index < holidayArray.length; index++) { // 12 month

            const daysArray = holidayArray[index].days

            for (let f = 0; f < daysArray.length; f++) {// 30 day

                const eventDetailArray = daysArray[f].events;

                for (let k = 0; k < eventDetailArray.length; k++) { // event

                    let eventObject = eventDetailArray[k]
                    
                    if (eventObject.date == null) {
                        const copy = {
                            ...eventObject, date: daysArray[f].date
                        };
                        eventObject = copy
                    }

                    if (eventObject.time_start == null) {
                        let timeStart = daysArray[f].date + ' 00:00:01'
                        const copy = {
                            ...eventObject, time_start: timeStart
                        };
                        eventObject = copy
                    }

                    if (eventObject.time_end == null) {
                        let timeEnd
                        if (Platform.OS === 'android') {
                            timeEnd = daysArray[f].date + ' 23:59:00'
                        } else {
                            // timeEnd = daysArray[f].date + ' 10:59:00'
                            timeEnd = daysArray[f].date + ' 23:59:00'
                        }

                        const copy = {
                            ...eventObject, time_end: timeEnd
                        };
                        eventObject = copy
                    }

                    if (eventObject.description == null) {
                        const copy = {
                            ...eventObject, description: "description"
                        };
                        eventObject = copy
                    }
                    await this._addEventsToCalendar(eventObject, location);
                    // if (eventObject.event_id != null) {

                    //     if (duplicateEventArray.length == 0) {
                    //         duplicateEventArray.push(eventObject.event_id)
                    //         await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);

                    //     } else {
                            
                    //         let data = await this.checkDuplicateEventCalendar(duplicateEventArray, eventObject.event_id)
                    //         let checkFlag = data[0]
                    //         duplicateEventArray = data[1]
                    //         if (checkFlag == false) {
                    //             await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);
                    //         }
                    //     }

                    // } else {

                    //     await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);

                    // }
                    //////console.log("==============Success==============")
                }
            }
        }
   //save event ID
        
    //    let tarray = await this.getEventIDFromDevice()
        // console.log('_onSyncCalendarEvent array => ',tarray.length)
        // await AsyncStorage.setItem(this.state.calendarName, this.state.listIDEventAdder);
        
    }
}
