import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, BackHandler,Alert } from "react-native";
import { styles } from "./../SharedObject/MainStyles"
import { Calendar } from 'react-native-calendars';
import Colors from "./../SharedObject/Colors"

import month from "./../constants/Month"

import moment from 'moment'

const _format = 'YYYY-MM-DD'
const _formatMonth = 'M'
const _formatYear = 'YYYY'
const _formatTime = 'hh:mm A'

import StringText from './../SharedObject/StringText'
import SharedPreference from './../SharedObject/SharedPreference'

import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import { StackActions } from 'react-navigation';
let codelocation;

export default class calendarEventDetailView extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            countDay: [],
            today: new Date(),
            year: new Date().getFullYear(),
            viewSection: false,
            daySelect: 0,
            _markedDates: this.initialState,
            dayObject: [],
            selectedDay: '2018-0-0',
            oldMark: {},
            monthObject: this.props.navigation.getParam("monthObject", {}),
            monthText: this.props.navigation.getParam("month", ""),
            dataResponse: this.props.navigation.getParam("dataResponse", ""),
            location: this.props.navigation.getParam("location", ""),
            isLoading: false,

            showLocation: this.props.navigation.getParam("showLocation", ""),
            selectLocation: this.props.navigation.getParam("selectLocation", ""),

        }
        // console.log("calendarEventDetailView ==> monthObject ==> ", this.state.monthObject)
        // console.log("calendarEventDetailView ==> monthText ==> ", this.state.monthText)
        codelocation = this.props.navigation.getParam("codelocation", "")
        firebase.analytics().setCurrentScreen(SharedPreference.FUNCTIONID_CALENDAR_EVENT)

    }

    componentDidMount() {

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        this.settimerInAppNoti()

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearTimeout(this.timer);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    componentWillMount() {
        this.getDataOnView()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    }

    settimerInAppNoti() {
        this.timer = setTimeout(() => {
            this.onLoadInAppNoti()
        }, SharedPreference.timeinterval);

    }

    onLoadInAppNoti = async () => {
        
        // if (!SharedPreference.lastdatetimeinterval) {
        //     let today = new Date()
        //     const _format = 'YYYY-MM-DD hh:mm:ss'
        //     const newdate = moment(today).format(_format).valueOf();
        //     SharedPreference.lastdatetimeinterval = newdate
        // }

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        code = data[0]
        data = data[1]

        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog(data)

        } else if (code.SUCCESS == data.code) {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);

            // for (let index = 0; index < dataArray.length; index++) {
            //     const dataReceive = dataArray[index];
            //     // //console.log("element ==> ", dataReceive.function_id)

            //     if (dataReceive.function_id == "PHF06010") {//if nonPayroll
            //         dataListArray = dataReceive.data_list

            //         // //console.log("dataListArray ==> ", dataListArray)
            //         for (let index = 0; index < dataListArray.length; index++) {
            //             const str = dataListArray[index];
            //             // //console.log("str ==> ", str)
            //             var res = str.split("|");
            //             // //console.log("res ==> ", res[1])
            //             var data = res[1]

            //             var monthYear = data.split("-");
            //             // //console.log("dataListArray ==> monthYear ==> ", monthYear)

            //             var year = monthYear[0]
            //             var month = monthYear[1]

            //             for (let index = 0; index < dataCustomArray.length; index++) {
            //                 const data = dataCustomArray[index];
            //                 // //console.log("dataCustomArray data ==> ", data)
            //                 // //console.log("dataCustomArray year ==> ", data.year)

            //                 if (year == data.year) {
            //                     const detail = data.detail
            //                     // //console.log("detail ==> ", detail)
            //                     // //console.log("month select  ==> ", month)

            //                     let element = detail.find((p) => {
            //                         return p.month === JSON.parse(month)
            //                     });
            //                     // //console.log("element ==> ", element)

            //                     element.badge = element.badge + 1
            //                     //console.log("detail badge ==> ", element.badge)
            //                 }
            //             }
            //         }
            //     } else if (dataReceive.function_id == "PHF02010") {

            //         console.log("announcement badge ==> ", dataReceive.badge_count)

            //         this.setState({

            //             notiAnnounceMentBadge: parseInt(dataReceive.badge_count) + parseInt(this.state.notiAnnounceMentBadge)
            //         })

            //     } else if (dataReceive.function_id == 'PHF05010') {
            //         console.log('new payslip arrive')
            //         this.setState({
            //             notiPayslipBadge: parseInt(dataReceive.badge_count) + this.state.notiPayslipBadge
            //         }, function () {
            //             dataReceive.data_list.map((item, i) => {

            //                 SharedPreference.notiPayslipBadge.push(item)
            //                 // = dataReceive.data_list

            //             })
            //         })
            //         console.log('notiPayslipBadge',SharedPreference.notiPayslipBadge)
            //     }

            // }


        }else{

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);

        }

    }

    onAutenticateErrorAlertDialog(error) {

        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
            StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog(data) {
        SharedPreference.userRegisted=false;
        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            StringText.ALERT_SESSION_AUTHORIZED_TITILE,
            StringText.ALERT_SESSION_AUTHORIZED_DESC,
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }

    getDataOnView() {
        const selectedMonth = moment(this.state.monthText).format(_formatMonth);
        const vacation1 = { key: 'number1', color: Colors.calendarYellowDotColor };
        const vacation2 = { key: 'number2', color: Colors.calendarYellowDotColor };


        if (this.state.monthObject) {
            if (selectedMonth == this.state.monthObject.month) {

                this.state.dayObject = this.state.monthObject.days;
                const original = {}
                for (let index = 0; index < this.state.dayObject.length; index++) {

                    const datemonth = this.state.dayObject[index].date;

                    console.log("selectedMonth ==> datemonth ", datemonth)
                    console.log("selectedMonth ==> datemonth ", this.state.dayObject[index].special_holiday)

                    if (this.state.dayObject[index].special_holiday == "Y") {
                        console.log("selectedMonth ==> Y")
                        let count = this.state.dayObject[index].events.length;

                        if (count > 1) {
                            let hasEvent = false
                            let countEvent = 0
                            let array = this.state.dayObject[index].events
                            for (let index = 0; index < array.length; index++) {
                                const element = array[index];
                                if (element.event_id != null) {
                                    countEvent = countEvent + 1
                                    hasEvent = true
                                }
                            }

                            if (hasEvent == false) {
                                const copy = {
                                    ...original, [datemonth]: { marked: true, selectedColor: Colors.calendarBlueText }
                                };
                                original = copy

                            } else if ((hasEvent == true) && (countEvent == 1)) {
                                const copy = {
                                    ...original, [datemonth]: { dots: [vacation1], marked: true, selectedColor: Colors.calendarBlueText }
                                };
                                original = copy
                            } else {
                                const copy = {
                                    ...original, [datemonth]: { dots: [vacation1, vacation2], marked: true, selectedColor: Colors.calendarBlueText }
                                };
                                original = copy
                            }
                        } else {
                            const copy = {
                                ...original, [datemonth]: { marked: true, selectedColor: Colors.calendarBlueText }
                            };
                            original = copy
                        }

                    } else if (this.state.dayObject[index].special_holiday == "N") {
                        console.log("selectedMonth ==> N")
                        let count = this.state.dayObject[index].events.length;

                        if (count > 1) {
                            let hasEvent = false
                            let countEvent = 0
                            let array = this.state.dayObject[index].events
                            for (let index = 0; index < array.length; index++) {
                                const element = array[index];
                                if (element.event_id != null) {
                                    countEvent = countEvent + 1
                                    hasEvent = true
                                }
                            }
                            if (hasEvent == false) {
                                const copy = {
                                    ...original, [datemonth]: { marked: true, selectedColor: Colors.calendarRedText }
                                };
                                original = copy

                            } else if ((hasEvent == true) && (countEvent == 1)) {
                                const copy = {
                                    ...original, [datemonth]: { dots: [vacation1], marked: true, selectedColor: Colors.calendarRedText }
                                };
                                original = copy
                            } else {
                                const copy = {
                                    ...original, [datemonth]: { dots: [vacation1, vacation2], marked: true, selectedColor: Colors.calendarRedText }
                                };
                                original = copy
                            }
                        } else {
                            const copy = {
                                ...original, [datemonth]: { marked: true, selectedColor: Colors.calendarRedText }
                            };
                            original = copy
                        }

                    } else {//W
                        console.log("selectedMonth ==> W")
                        let count = this.state.dayObject[index].events.length;

                        if (count > 1) {
                            const copy = {
                                ...original, [datemonth]: {
                                    dots: [vacation1, vacation2],
                                    marked: true, dotColor: Colors.calendarDotColor
                                }
                            };
                            original = copy
                        } else {
                            const copy = {
                                ...original, [datemonth]: {
                                    dots: [vacation1],
                                    marked: true, dotColor: Colors.calendarDotColor
                                }
                            };
                            original = copy
                        }
                    }
                };
                this.setState({
                    _markedDates: original
                })
                this.state._markedDates = original
            }
        }
    }

    onBack() {

        this.setState({
            isLoading: true

        }, function* () {
        });

        let year = moment(this.state.monthText).format(_formatYear)
        // this.props.navigation.dispatch(StackActions.popToTop());
        this.props.navigation.navigate('calendarYearView', {
            selectYear: year,
            dataResponse: this.state.dataResponse,
            location: this.state.location,
            showLocation: this.state.showLocation,
            selectLocation: this.state.selectLocation,
            codelocation: codelocation,
        });

    }

    getDataObject(datetime) {
        for (let index = 0; index < this.state.dayObject.length; index++) {
            const datemonth = this.state.dayObject[index].date;
            if (datemonth == datetime) {
                return [this.state.dayObject[index].special_holiday, this.state.dayObject[index].date, this.state.dayObject[index]]
            }
        }
    }

    onDaySelect = (day) => {
        //////////console.log('this.state._markedDates : ', this.state._markedDates);
        if (!this.state._markedDates) {
            return
        }
        const _selectedDay = moment(day.dateString).format(_format);
        let marked = true;
        let selected = true;

        if (this.state._markedDates[_selectedDay]) {
            marked = !this.state._markedDates[_selectedDay].marked;
            selected = !this.state._markedDates[_selectedDay].selected;
        }
        const original = this.state._markedDates[_selectedDay];
        const copy = {
            marked, selected, selectedColor: "black", ...original
        };


        // //////////console.log("copy : ", copy);
        const updatedMarkedDates = {
            ...this.state._markedDates,
            ...{
                [_selectedDay]: copy,
                [this.state.selectedDay]: this.state.oldMark
            }
        }

        this.setState({
            oldMark: this.state._markedDates[_selectedDay],
            _markedDates: updatedMarkedDates
        })

        if (this.state.selectedDay == _selectedDay) {
            //////////console.log("_selectedDay =========>  viewSection false : " + _selectedDay);
            this.setState({
                viewSection: false,
                selectedDay: "",
            });
        } else {
            //////////console.log("_selectedDay =========>  viewSection true : " + _selectedDay);
            this.setState({
                viewSection: true,
                selectedDay: _selectedDay,
            });
        }
    }

    onPressToday() {//TODO
        ////console.log("onPressToday")
        this.setState({ isLoading: true })
        this.onLoadCalendarAPI(new Date().getFullYear(), this.state.location)
    }

    renderProgressView() {
        if (this.state.isLoading) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.alertDialogBackgroudAlpha} />
                    {/* bg */}
                    <View style={styles.alertDialogContainer}>
                        <ActivityIndicator />
                    </View>
                </View>
            )
        }
    }

    onLoadCalendarAPI = async (year, location) => {

        ////console.log("onLoadCalendarAPI ==> year : ", year, " , location : ", location)

        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + year + '&company=' + location, SharedPreference.FUNCTIONID_WORKING_CALENDAR)
        code = data[0]
        data = data[1]

        ////console.log("calendarCallback : ", data.code)

        if (code.SUCCESS == data.code) {
            let monthArray = data.data.holidays
            //////console.log("responseJson ======> monthArray.length ===> ", monthArray.length);

            let today = new Date()
            let _format = 'M'
            const selectedMonth = moment(today).format(_format);

            for (let index = 0; index < monthArray.length; index++) {
                const element = monthArray[index];
                if (element.month == selectedMonth) {
                    let formatdate = 'YYYY-MM-DD'
                    const monthText = moment(today).format(formatdate);

                    this.setState({
                        monthObject: element,
                        monthText: monthText,
                        isLoading: false
                    })
                    this.getDataOnView()
                }
            }
        } else {
            
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_TITLE,
                StringText.ALERT_CANNOT_CONNECT_DESC,
                [{
                    text: 'OK', onPress: () => {
                        this.setState({
                            isLoading: false
                        })
                    }
                },
                ],
                { cancelable: false }
            )
        }
    }

    onLoadCalendarAPI11 = async (year, company) => {
        ////////console.log("onLoadCalendarAPI : ", year, ' , company : ', company)
        return fetch(SharedPreference.HOST_API + '/api/' + SharedPreference.API_VERSION + '/calendar?year=' + year)
            .then((response) => response.json())
            .then((responseJson) => {
                //////console.log("responseJson ======> ", responseJson.status);

                if (responseJson.status == '200') {
                    let monthArray = responseJson.data.holidays
                    //////console.log("responseJson ======> monthArray.length ===> ", monthArray.length);

                    let today = new Date()
                    let _format = 'M'
                    const selectedMonth = moment(today).format(_format);

                    for (let index = 0; index < monthArray.length; index++) {
                        const element = monthArray[index];
                        if (element.month == selectedMonth) {
                            let formatdate = 'YYYY-MM-DD'
                            const monthText = moment(today).format(formatdate);

                            this.setState({
                                monthObject: element,
                                monthText: monthText,
                                isLoading: false
                            })
                            this.getDataOnView()
                        }
                    }
                }
                return responseJson
            })
            .catch((error) => {
                ////////console.log("responseJson error : ", error);

                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_DESC,
                    [{
                        text: 'OK', onPress: () => {
                            this.setState({
                                isLoading: false
                            })
                        }
                    },
                    ],
                    { cancelable: false }
                )
            });
    }

    renderEventComponent() {
        let object = this.getDataObject(this.state.selectedDay)
        if (this.state.viewSection) {
            return (
                <View style={{ height: 200, flexDirection: 'column' }}>
                    <Text style={styles.calendarEventTitleText}>Event</Text>
                    {this.getEventView(object)}
                </View>
            )
        }
    }

    getEventView(array) {
        // ////////console.log("object : ", object)
        if (array == 'undefined' || array == null) {
            return (<View style={{
                flex: 1, justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={styles.calendarNoEventItemText}>{StringText.CALENDAR_MONTHVIEW_NO_EVENT_TEXT}
                </Text>
            </View>
            )
        } else {
            let specailHoliday = array[0]
            let date = array[1]
            let object = array[2]

            eventDetail = []
            array = object.events


            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element.event_id != null) {
                    specailHoliday = 'W'
                }

                eventDetail.push(this.getSectionEventView(specailHoliday, element.all_day, date, element))
            }

            return (<ScrollView>
                {eventDetail}
            </ScrollView>)
        }
    }

    getSectionEventView(type, allday, date, object) {
        //type N Y W
        //allday Y N
        if (type == 'W') {
            if (allday == 'Y') {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>All Day</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarYellowDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            } else {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>{moment(object.time_start).format(_formatTime)}</Text>
                            <Text style={styles.calendarEventTimeEndText}>{moment(object.time_end).format(_formatTime)}</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarYellowDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.description}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            }
        } else if (type == 'Y') {
            if (allday == 'Y') {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>All Day</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarBlueDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            } else {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>{moment(object.time_start).format(_formatTime)}</Text>
                            <Text style={styles.calendarEventTimeEndText}>{moment(object.time_end).format(_formatTime)}</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarBlueDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.description}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            }
        } else {
            if (allday == 'Y') {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>All Day</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarRedDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            } else {
                return (<View>
                    <TouchableOpacity style={styles.calendarEventItemView} onPress={() => this.onOpenEventDetail(type, date, object)} >
                        <View style={styles.calendarEventItemLeftView}>
                            <Text style={styles.calendarEventTimeStartText}>{moment(object.time_start).format(_formatTime)}</Text>
                            <Text style={styles.calendarEventTimeEndText}>{moment(object.time_end).format(_formatTime)}</Text>
                        </View>
                        <View style={[styles.calendarEventCircleView, { backgroundColor: Colors.calendarRedDotColor }]}></View>
                        <View style={styles.calendarEventItemRightView}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.title}</Text>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={{ marginRight: 10 }}>{object.description}</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            }
        }
    }

    onOpenEventDetail(type, date, object) {
        this.props.navigation.navigate('calendarEventDetailView',
            {
                type: type,
                eventObject: [object],
                date: date,
                monthObject: this.state.monthObject,
                monthText: this.state.monthText,
                dataResponse: this.state.dataResponse,
                location: this.state.location,
                showLocation: this.state.showLocation,
                selectLocation: this.state.selectLocation,
                codelocation: codelocation,
            });
    }

    renderCalendarTable() {
        //console.log("renderCalendarTable ==> markedDates : ",this.state._markedDates)
        return (<Calendar
            current={this.state.monthText}
            monthFormat={''}
            hideArrows={true}
            hideExtraDays={false}
            disableMonthChange={true}
            hideDayNames={true}
            showWeekNumbers={false}
            onDayPress={this.onDaySelect}
            markedDates={this.state._markedDates}
            markingType={'multi-dot'}
            theme={{
                todayTextColor: Colors.redTextColor,
                dayTextColor: 'black'
            }}
        />)
    }


    renderDayName() {
        return (<View style={styles.calendarWeekTitleView}>
            {month.dayNamesShortMonthView.map((day, idx) => (
                <Text allowFontScaling={false} key={idx} accessible={false} style={styles.calendarDayHeader} numberOfLines={1} importantForAccessibility='no'>{day}</Text>
            ))}
        </View>)
    }

    render() {
        var today = new Date();
        return (
            <View style={styles.container} >
                <View style={styles.centerContainer} >
                    <View style={styles.navContainer}>
                        <TouchableOpacity style={styles.navLeftContainer} onPress={(this.onBack.bind(this))}>
                            <Image
                                style={styles.navBackButton}
                                source={require('../resource/images/Back.png')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navRightContainer} onPress={(this.onPressToday.bind(this))}>
                            <View style={{ margin: 10 }}>
                                <Text style={styles.calendarTitleRightText} >{StringText.CALENDER_YEARVIEW_YEAR_TODAY_BUTTON}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: Colors.navColor }}>
                            <View style={{ paddingLeft: 10, flex: 3 }}>
                                <Text style={styles.calendarMonthTitleText}>{month.monthNames[moment(this.state.monthText).format(_formatMonth) - 1]}</Text>
                                <Text style={styles.calendarYearTitleText}>{moment(this.state.monthText).format(_formatYear)}</Text>
                            </View>
                            {this.renderDayName()}
                        </View>

                        <View style={{ height: '80%' }}>
                            {this.renderCalendarTable()}
                            {this.renderEventComponent()}
                        </View>
                    </View>
                </View>
                {this.renderProgressView()}
            </View>
        );
    }
}