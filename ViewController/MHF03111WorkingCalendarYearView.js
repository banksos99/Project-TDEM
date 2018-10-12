import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import Authorization from '../SharedObject/Authorization'
import RNCalendarEvents from 'react-native-calendar-events';
import {
    Text,
    View,
    TouchableOpacity,
    Image, Picker, ListView,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
    BackHandler,
    PermissionsAndroid,
    PanResponder
} from 'react-native';

import { Calendar, LocaleConfig } from 'react-native-calendars';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"

import moment from 'moment'
const _format = 'YYYY-MM-DD'

import SharedPreference from '../SharedObject/SharedPreference'
import StringText from '../SharedObject/StringText'

import RestAPI from "../constants/RestAPI"
import EventCalendar from "../constants/EventCalendar"
import SaveProfile from "../constants/SaveProfile"
import CalendarPDFAPI from "../constants/CalendarPDFAPI"
import SaveAutoSyncCalendar from "../constants/SaveAutoSyncCalendar";
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import { DocumentDirectoryPath } from 'react-native-fs';

import firebase from 'react-native-firebase';
import Layout from "../SharedObject/Layout";

let codelocation;
let scale = Layout.window.width / 320;
export default class calendarYearView extends Component {

    eventCalendar = new EventCalendar()
    SaveProfile = new SaveProfile()
    saveAutoSyncCalendar = new SaveAutoSyncCalendar()
    panResponder = {};
    constructor(props) {
        super(props);
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                SharedPreference.Sessiontimeout = 0
                return false
            },
            onStartShouldSetPanResponderCapture: () => {
   
                SharedPreference.Sessiontimeout = 0
  
                return false
            }
        })

        console.log('calendar constructor =>')
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            connectWithServer: true,
            url: '',
            countDay: [],

            yearObject: '',
            monthObject: '',
            yearsPickerArray: [],
            locationPickerArray: [],
            //
            selectYear: this.props.navigation.getParam("selectYear", ""),
            selectDownloadYear: '',
            selectLocation: this.props.navigation.getParam("selectLocation", ""),

            showYear: '',
            showLocation: this.props.navigation.getParam("showLocation", ""),

            selectYearPicker: this.props.navigation.getParam("selectYear", ""),
            yearPickerForDownloadPDFFileView: '',
            yearsPickerView: '',
            locationPickerView: '',

            isLoading: true,
            calendarEventData: '',

            // data
            locationPicker: '',
            today: new Date(),
            dataResponse: this.props.navigation.getParam("dataResponse", ""),
            dataResponse2: this.props.navigation.getParam("dataResponse2", ""),
            havePermission: false,
            changeData: false,
            newPage: false,
            isLoadingPDF: false,

            page: this.props.navigation.getParam("page", 2),
            isSycnCalendarFirstTime: false,


        }
        codelocation = this.props.navigation.getParam("codelocation", "");
        // ////console.log("WorkingCalendar => ",SharedPreference.calendarAutoSync)
        this.LocaleConfig()
        this.getYearSelect()
        this.setNewPicker()
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_WORKING_CALENDAR)

    }




    componentDidUpdate() {

        // this.state = {
        //     dataResponse2: this.props.navigation.getParam("dataResponse2", ""),

        // }

        // console.log('WorkingCalendar ==> componentDidUpdate', this.state.dataResponse2)
        // if (this.state.selectLocation != SharedPreference.selectLocationCalendar) {
            

        //     SharedPreference.selectLocationCalendar = this.state.selectLocation
        //     if (this.state.dataResponse2) {

        //         // this.props.navigation.navigate('calendarYearView2', {//TODO change
        //         //     dataResponse: data,
        //         //     selectYear: this.state.selectYear,
        //         //     location: location,
        //         //     showLocation: this.state.selectLocation,
        //         //     selectLocation: this.state.selectLocation,
        //         //     codelocation: codelocation,

        //         // });
        //     }
        // }

        // if (this.state.selectLocation != SharedPreference.selectLocationCalendar) {
            
        //     SharedPreference.selectLocationCalendar = this.state.selectLocation

        // }



    }

    componentWillMount() {
        console.log('WorkingCalendar ==> componentWillMount', SharedPreference.selectLocationCalendar)
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    setNewPicker() {
        // array = SharedPreference.COMPANY_LOCATION
        locationArray = []

        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            locationArray.push({
                label: element.value,
                value: element.key
            })
        }
        this.state.locationPicker = locationArray
    }

    async componentDidMount() {

        console.log("WorkingCalendar ==> componentDidMount")

        this.getYearSelect()
        ////console.log("WorkingCalendar ==> componentDidMount ==> finish getYearSelect")

        this.getYearView(this.state.selectYear, this.state.dataResponse)
        ////console.log("WorkingCalendar ==> componentDidMount ==> finish getYearView")

        let autoSyncCalendarBool = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
        ////console.log("WorkingCalendar 1==> ",autoSyncCalendarBool)
        ////console.log("WorkingCalendar 2==> ",SharedPreference.calendarAutoSync)

        if(autoSyncCalendarBool == null){
            ////console.log("WorkingCalendar autoSyncCalendarBool ==> null")
            await RNCalendarEvents.authorizationStatus()
            this.saveAutoSyncCalendar.setAutoSyncCalendar(true)
            this.onSynWithCalendar()
        }else{
            ////console.log("WorkingCalendar autoSyncCalendarBool ==> else")

            if ((SharedPreference.calendarAutoSync == true) && (this.state.page == 1)) {
               
                this.addEventOnCalendar()
                this.setState({
                    isSycnCalendarFirstTime: true,
                    isLoading: true
                })
            }

        }

        // this.settimerInAppNoti()

    }

    componentWillUnmount() {
        console.log("WorkingCalendar ==> componentWillUnmount")
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
        clearTimeout(this.timer);
    }

    settimerInAppNoti() {
        this.timer = setTimeout(() => {
            this.onLoadInAppNoti()
        }, SharedPreference.timeinterval);

    }

    onLoadInAppNoti = async () => {
        
        if (!SharedPreference.lastdatetimeinterval) {
            let today = new Date()
            const _format = 'YYYY-MM-DD hh:mm:ss'
            const newdate = moment(today).format(_format).valueOf();
            SharedPreference.lastdatetimeinterval = newdate
        }

     //   this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
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
        SharedPreference.userRegisted = false;
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
        if (!SharedPreference.sessionTimeoutBool) {
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
    }


    // async function requestCameraPermission() {
    // try {
    //     const granted = await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.CAMERA,
    //         {
    //             'title': 'Cool Photo App Camera Permission',
    //             'message': 'Cool Photo App needs access to your camera ' +
    //                 'so you can take awesome pictures.'
    //         }
    //     )
    //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //         console.log("You can use the camera")
    //     } else {
    //         console.log("Camera permission denied")
    //     }
    // } catch (err) {
    //     console.warn(err)
    // }

    getYearSelect() {
        let yearCount = 3 //user can choose  3 year ==>last year ,current year ,next year
        let lastYear = this.state.today.getFullYear() - 1
        for (let index = 0; index < yearCount; index++) {
            let year = lastYear + index
            this.state.yearsPickerArray[index] = {
                label: "" + year + "",
                value: "" + year + "",
            };
        }//copy 3 years to yearsPickerArray
    }

    loadDataFromAPI = async (year, location) => {
        // reset api
        this.setState({
            countDay: [],
            yearObject: [],
            isLoading: true,
            yearviewPicker: false,
        })

        this.setState({ isLoading: true })
        // await this.openNewPage(this.state.selectLocation)
        await this.onLoadCalendarAPI(year, location)
    }

    onLoadCalendarAPI = async (year, location) => {
        //////////console.log("onLoadCalendarAPI ====> year : ", year, " , location : ", location)
        //////////console.log("location : ", this.state.selectLocation)




        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + year + '&company=' + codelocation, SharedPreference.FUNCTIONID_WORKING_CALENDAR)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            //////////console.log("onLoadCalendarAPI ====> SUCCESS")
            this.getYearView(this.state.selectYear, data)

        } else {
            Alert.alert(
                StringText.CALENDAR_ALERT_NO_DATA_TITLE,
                StringText.CALENDAR_ALERT_NO_DATA_DESC,
                [{
                    text: 'OK', onPress: () => {
                        //////////console.log("cancel downlosad")
                        this.setState({
                            isLoading: false,
                            selectYear: this.state.showYear,
                        })
                    }
                }],
                { cancelable: false }
            )
        }

    }

    getLocalYearView(year) {
        let calendarEventData
        if (year == '2017') {
            calendarEventData = _calendarEventData2017
        } else if (year == '2018') {
            calendarEventData = _calendarEventData2018
        }
        this.getYearView(year, calendarEventData)
    }

    getYearView = async (year, calendarEventData) => {
        //////////console.log("getYearView : year ==> ", year)
        //////////console.log("getYearView : calendarEventData ==> ", calendarEventData)

        let monthYear = 12
        const original = [];

        if (calendarEventData.code == 200) {
            for (let index = 0; index < monthYear; index++) {
                let object = this.getMonthEvent((index + 1), calendarEventData)
                original[index] = object
            }
        } else {

            // //////////console.log("this.state.selectLocation : ", this.state.selectLocation)
            // showLocation = "Company"
            year = new Date().getFullYear()
            this.state.selectYear = year;
        }

        // if (this.state.selectLocation == null) {
        //     showLocation = await this.getFullLocation("TA")
        // } else {

        //     showLocation = await this.getFullLocation(this.state.selectLocation)
        // }

        //////////console.log("getYearView : showLocation ==> ", showLocation)
        //////////console.log("getYearView : year ==> ", year)

        this.showAllMonthView()
        this.setState({
            yearObject: original,
            showYear: year,
            showYear: this.state.selectYear,
            isLoading: false,
            calendarEventData: calendarEventData,
            showLocation: this.state.showLocation,
            dataResponse: calendarEventData,
        })
    }

    getMonthEvent(month, calendarEventData) {
        yearObject = calendarEventData.data.holidays
        for (let index = 0; index < yearObject.length; index++) {
            const element = yearObject[index];
            if (element.month == month) {
                ////////////////console.log("getMonthEvent yearObject ==> ", yearObject[index])
                return yearObject[index]
            }
        }
        return {
            "month": month,
            "days": []
        }
    }

    showAllMonthView() {
        //////////console.log("Calendar ==> showAllMonthView")
        monthView = []
        monthView1 = []
        monthView2 = []
        monthView3 = []
        monthView4 = []
        month = 12 //month count


        for (let f = 0; f < month; f++) {

            let selectMonth = (f + 1)
            // //////////console.log("Calendar ==> selectMonth : ", selectMonth)

            let monthText = this.state.showYear + '-' + selectMonth + '-01'
            if (selectMonth < 10) {
                monthText = this.state.showYear + '-0' + selectMonth + '-01'
            }
            // //////////console.log("Calendar ==> monthText : ", monthText)
            this.state.countDay = []

            monthView.push(
                <TouchableOpacity key={f} style={[styles.container]}
                    onPress={() => this.onPressCalendar(monthText)} >
                    <Calendar
                        
                        current={monthText}
                        hideArrows={true}
                        hideExtraDays={false}
                        disableMonthChange={true}
                        monthFormat={'MMMM'}
                        hideDayNames={false}
                        
                        theme={{
                            
                            dayTextColor: 'white',
                            todayTextColor: 'white',
                            monthTextColor: 'white',
                            selectedDayBackgroundColor: '#333248',
                            'stylesheet.calendar.header': {
                                week: {
                                    marginTop: 0,
                                
                                    flexDirection: 'row',
                                },
                                header: {
                                    justifyContent: 'space-between',
                                },
                                monthText: {
                                    fontSize: 10 * scale,
                                    textAlign: 'left',
                                    color: Colors.calendarRedText,
                                
                                }
                            },
                        
                        }}

                        dayComponent={({ date, state }) => {
                            // //////////console.log("selectedDateMonth dayComponent =====> : ", date)
                            // //////////console.log("selectedDateMonth dayComponent =====> state : ", state)

                            this.state.countDay.push(date.day);
                            const selectedDateMonth = moment(date.dateString).format(_format);
                            let checkSpecialHoliday = this.checkSpecialHoliday(selectedDateMonth);
                            // console.log("selectedDateMonth =====> : ", selectedDateMonth)
                            // console.log("checkSpecialHoliday =====> ", checkSpecialHoliday)

                            if ((this.state.today.getDate() == date.day) && ((this.state.today.getMonth() + 1) == date.month)
                                && (this.state.today.getFullYear() == date.year)) {
                                return <View style={styles.calendarCurrentDayCicleContainer}>
                                    <View style={[styles.calendarCurrentDayCircle, { backgroundColor: state === 'disabled' ? 'white' : '#adf0c9' }]} />
                                    {/* <Text style={styles.calendarCurrentDayText}> */}
                                    <Text style=
                                        {checkSpecialHoliday == 'Y' ? { fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarBlueText } :
                                            checkSpecialHoliday == 'N' ? { fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarRedText } :
                                                { fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarGrayText }
                                        }
                                    >
                                        {date.day}

                                    </Text>
                                </View>
                            } else if (checkSpecialHoliday == 'Y') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarBlueText }}>
                                        {date.day}</Text>
                                </View>
                            } else if (checkSpecialHoliday == 'N') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarRedText }}>
                                        {date.day}</Text>
                                </View>
                            } else if (checkSpecialHoliday == 'W') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : Colors.calendarGrayText }}>
                                        {date.day}</Text>
                                </View>
                                //} else if ((this.state.countDay.length % 7) == 0 || (this.state.countDay.length % 7) == 1) {//Holiday
                                //              return <View style={styles.calendarDayContainer}>
                                //                <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : Colors.redTextColor }}>
                                //                  {date.day}</Text>
                                //s        </View>

                            } else {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : 'black' }}>
                                        {date.day}</Text>
                                </View>
                            }

                            // if ((this.state.today.getDate() == date.day) && ((this.state.today.getMonth() + 1) == date.month)
                            //     && (this.state.today.getFullYear() == date.year)) {
                            //     return <View style={styles.calendarCurrentDayCicleContainer}>
                            //         <View style={[styles.calendarCurrentDayCircle, { backgroundColor: state === 'disabled' ? 'white' : '#adf0c9' }]} />
                            //         <Text style={checkSpecialHoliday == 'Y' ?
                            //             styles.calendarCurrentDayTextblue :
                            //             checkSpecialHoliday == 'N' ?
                            //                 styles.calendarCurrentDayTextred :
                            //                 styles.calendarCurrentDayTextblack}>
                            //             {date.day}
                            //         </Text>
                            //     </View>
                            // } else {
                            //     return <View style={styles.calendarDayContainer}>
                            //         <Text style={{ fontSize: 10 * scale, textAlign: 'center', color: state === 'disabled' ? 'white' : 'black' }}>
                            //             {date.day}</Text>
                            //     </View>
                            // }
                        }}
                    />
                </TouchableOpacity>
            )
            if (selectMonth == 3) {
                monthView1 = monthView
                monthView = []
            } else if (selectMonth == 6) {
                monthView2 = monthView
                monthView = []
            } else if (selectMonth == 9) {
                monthView3 = monthView
                monthView = []
            } else if (selectMonth == 12) {
                monthView4 = monthView
                monthView = []
            }

        }

        return (<View style={styles.detailContainer} >
            <View style={styles.calendarRowBox} >
                {monthView1}
            </View>
            <View style={styles.calendarRowBox} >
                {monthView2}
            </View>
            <View style={styles.calendarRowBox} >
                {monthView3}
            </View>
            <View style={styles.calendarRowBox} >
                {monthView4}
            </View>
        </View>)

    }

    checkSpecialHoliday(selectedDateMonth) {
        ////////////console.log("selectedDateMonth : ", selectedDateMonth)
        try {
            const month = moment(selectedDateMonth).format('M');
            ////////////console.log("month : ", month)
            let checkObject = this.state.yearObject[(month - 1)]
            ////////////console.log("checkObject : ", checkObject)

            if (checkObject == []) {
                return false
            }
            let objectMonth = checkObject.days
            ////////////console.log("objectMonth : ", objectMonth)

            for (let index = 0; index < objectMonth.length; index++) {
                let date = objectMonth[index].date

                if (date == selectedDateMonth) {
                    let data = objectMonth[index]
                    if (data.special_holiday == 'Y') {
                        return 'Y'
                    } else if (data.special_holiday == 'N') {
                        return 'N'
                    } else { //W
                        return false
                    }

                }
            }
            return false

        } catch (e) {
            return false
        }

    }

    LocaleConfig() {
        LocaleConfig.locales['en'] = {
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthNamesShort: ['JAN.', 'FEB.', 'MAR', 'APR', 'MAY', 'JUN', 'JULY.', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        };
        LocaleConfig.defaultLocale = 'en';
    }

    resetCalendar() {

        // if (this.state.connectWithServer == true) {
        this.loadDataFromAPI(this.state.selectYear, this.state.selectLocation)
        // } else {
        // this.getLocalYearView(this.state.selectYear)
        // }
    }

    onPressCalendar(datetime) {
        ////////////console.log("datetime : ", datetime)
        const month = moment(datetime).format('M');
        let monthObject = this.state.yearObject[(month - 1)]
        //////////console.log("onPressCalendar ==> ", monthObject)
        this.props.navigation.navigate('calendarMonthView',
            {
                month: datetime,
                monthObject: monthObject,
                dataResponse: this.state.dataResponse,
                location: this.state.selectLocation,
                showLocation:this.state.selectLocation,
                selectLocation:this.state.selectLocation,
                codelocation:codelocation
                
            });
    }

    onPDF(year) {
        this.setState({
            selectYear: year
        })
    }

    onPressSelectYearWhenSelectPDF(year, i) {
        // //////console.log('android select year => ', year, i)
        this.setState({
            selectYear: year,
            yearPickerForDownloadPDFFileView: false,
            isLoadingPDF: true
        }, function () {

            if (Platform.OS === 'android') {

                this.requestPDFPermission()

            } else {

                this.onloadPDFFile();

            }
        })
    }
    
    onPressSelectYearWhenSelectLocation(year, type) {
        console.log('onPressSelectYearWhenSelectLocation ', year)
        this.setState({
            selectYear: year,

            yearviewPicker: false
        }, function () {

            // this.state.yearviewPicker = false

            this.resetCalendar()
        })
    }

    onPressLocation(locationFull, locationShort) {
        console.log('locationShort', locationShort)
        this.setState({
            selectLocation: locationShort
        }, function () {

            // this.state.selectLocation = locationShort
            this.getLocation(locationShort)
        })



    }

    getShortLocation = async (fullLocation) => {
        array = this.state.locationPicker
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (fullLocation == element.label) {
                return element.value
            }
        }
        return
    }

    getFullLocation = async (shortLocation) => {
        array = this.state.locationPicker
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (shortLocation == element.value) {
                return element.label
            }
        }
        return
    }

    getLocation = async (location) => {
        console.log("WorkingCalender ==> this.state.selectLocation ==> ", this.state.selectLocation)
        // if (Platform.OS === 'ios') {

        //     locationShort = await this.getShortLocation(this.state.selectLocation)
        //     if (locationShort == undefined) {
        //         locationShort = this.state.locationPicker[0].value
        //     }

        //     this.setState({
        //         selectLocation: locationShort
        //     })
        // } else {
        //     this.setState({
        //         selectLocation: location
        //     })
        // }

        //////console.log("workingCalendar ==> getLocation : ", this.state.selectLocation)
        console.log("SharedPreference.COMPANY_LOCATION : ", SharedPreference.COMPANY_LOCATION)
        console.log("this.state.selectLocation : ", this.state.selectLocation)
        let locationdef = ''
        for (let i = 0; i < SharedPreference.COMPANY_LOCATION.length; i++) {
            console.log("SharedPreference.COMPANY_LOCATION : ", SharedPreference.COMPANY_LOCATION[i].value)
            if (SharedPreference.COMPANY_LOCATION[i].value === this.state.selectLocation) {
                
                locationdef = SharedPreference.COMPANY_LOCATION[i].key;
            }
        }

        this.setState({
            locationPickerView: false,
            isLoading: true,
        })

        await this.openNewPage(locationdef)
    }

    openNewPage = async (location) => {
        // console.log("selectLocation 222 ==> ", this.state.selectLocation,'location',location)
        codelocation = location;
        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + this.state.selectYear + '&company=' + codelocation, SharedPreference.FUNCTIONID_WORKING_CALENDAR)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            this.setState({
                
                isLoading:false
            })
            this.props.navigation.navigate('calendarYearView2', {//TODO change
                dataResponse: data,
                selectYear: this.state.selectYear,
                location: location,
                showLocation:this.state.selectLocation,
                selectLocation:this.state.selectLocation,
                codelocation:codelocation
            });
        } else {
            Alert.alert(
                StringText.CALENDAR_MONTHVIEW_SELECT_NEW_PLACE_TITLE,
                StringText.CALENDAR_MONTHVIEW_SELECT_NEW_PLACE_DESC,
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

    renderDialog() {
        if (this.state.yearviewPicker) {
            if (Platform.OS === 'android') {
                // //////////console.log("this.state.yearsPickerArray : ", this.state.yearsPickerArray)
                return (
                    
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                                <Text style={styles.titlepicker}>
                                    {StringText.CALENDER_YEARVIEW_SELECT_YEAR_TITLE}
                                </Text>
                                <View style={{height:20}}/>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        this.state.yearsPickerArray.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                                onPress={() => { this.onPressSelectYearWhenSelectLocation(i.label) }}
                                                key={index + 100}>
                                                <View style={styles.pickerViewAndroidContrianer} key={index + 200}>
                                                <Text style={i.label === this.state.selectYear ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {i.label}</Text>
                                                    {/* <Text style={styles.pickerViewAndroidText}> {i.label}</Text> */}
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
                                <View style={{  flexDirection: 'row', height: 50, alignItems: 'center',justifyContent:'center' }}>
                                <View style={{ flex: 2}}></View>
                                    <TouchableOpacity style={{ flex: 1 }}
                                        onPress={() => {
                                            this.setState({
                                               
                                                yearviewPicker: false
                                            }, function () {
                                               

                                            })
                                        }}>
                                        <Text style={styles.buttonpicker}>Cancel</Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            
                            </View>
                        </View>
                    </View >
                )
            } else {
                return (
                    <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={styles.titlepicker}>{StringText.CALENDER_YEARVIEW_SELECT_YEAR_TITLE}</Text>
                            </View>
                            <Picker
                                selectedValue={this.state.selectYear}
                                onValueChange={(itemValue, itemIndex) => this.setState({ selectYear: itemValue })}>
                                {this.state.yearsPickerArray.map((i, index) => (
                                    <Picker.Item key={index} label={i.label} value={i.value} />
                                ))}
                            </Picker>
                            <View style={{ flexDirection: 'row', height: 50 }}>
                                <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                    onPress={() => {
                                        this.setState({

                                            yearviewPicker: false
                                        }, function () {

                                        })
                                    }}>
                                    <Text style={styles.buttonpickerdownloadleft}>Cancel</Text>
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}></View>

                                <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                    onPress={() => {
                                        this.setState({ yearviewPicker: false }),
                                            this.resetCalendar()
                                    }}>
                                    <Text style={styles.buttonpickerdownloadright}>{StringText.CALENDER_YEARVIEW_SELECT_YEAR_BUTTON}</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View >
                    </View>
                )
            }
        }

        if (this.state.yearPickerForDownloadPDFFileView) {
            if (Platform.OS === 'android') {
                return (
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                                <Text style={styles.titlepicker}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_TITLE}</Text>
                                <View style={{height:20}}/>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        this.state.yearsPickerArray.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                            key ={200 + index}
                                                onPress={() => { this.onPressSelectYearWhenSelectPDF(i.label,i) }}
                                                >
                                                <View style={styles.pickerViewAndroidContrianer}>
                                                    <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {i.label}</Text>
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
                                <View style={{  flexDirection: 'row', height: 50, justifyContent:'center' }}>
                                <View style={{ flex:2}}></View>
                                    <TouchableOpacity style={{ flex: 1 }}
                                        onPress={() => {
                                            this.setState({
                                               
                                                yearPickerForDownloadPDFFileView: false
                                            }, function () {
                                               

                                            })
                                        }}>
                                        <Text style={styles.buttonpicker}>Cancel</Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            </View>
                        </View>
                    </View >
                )
            } else {
                return (
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                                <Text style={styles.titlepicker}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_TITLE}</Text>
                                <Picker
                                    selectedValue={this.state.selectYear}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectYear: itemValue })}>
                                    {this.state.yearsPickerArray.map((i, index) => (
                                        <Picker.Item key={index} label={i.label} value={i.value} />
                                    ))}
                                </Picker>
                                <View style={{  flexDirection: 'row', height: 50 }}>
                                    <TouchableOpacity style={{ flex: 2 , justifyContent:'center'}}
                                        onPress={() => {
                                            this.setState({
                                               
                                                yearPickerForDownloadPDFFileView: false
                                            }, function () {
                                               

                                            })
                                        }}>
                                        <Text style={styles.buttonpickerdownloadleft}>Cancel</Text>
                                    </TouchableOpacity>
                                    <View style={{ flex:1}}></View>
                                    <TouchableOpacity style={{ flex:2,justifyContent:'center'}}
                                        onPress={() => {
                                            //////console.log('selectYear =>: ',this.state.selectYear);
                                            this.setState({
                                                yearPickerForDownloadPDFFileView: false,
                                                isLoadingPDF: true
                                            }, function () {
                                                this.onloadPDFFile();

                                            })

                                        }}>
                                        <Text style={styles.buttonpickerdownloadright}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_BUTTON}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View >
                )
            }
        }

        if (this.state.locationPickerView) {
            if (Platform.OS === 'android') {
                return (
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                                <Text style={styles.titlepicker}>
                                    {StringText.CALENDER_YEARVIEW_LOCATION_TITLE}
                                </Text>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        SharedPreference.COMPANY_LOCATION.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                                onPress={() => { this.onPressLocation(i.label, i.value) }}
                                                key={index + 300}>
                                                <View style={styles.pickerViewAndroidContrianer} key={index + 200}>
                                                <Text style={i.value === this.state.showLocation ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {i.value}</Text>
                                                    {/* <Text style={styles.pickerViewAndroidText}> {i.label}</Text> */}
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
                                <View style={{ flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ flex: 2 }}></View>
                                    <TouchableOpacity style={{ flex: 1 }}
                                        onPress={() => {
                                            this.setState({
                                                selectLocation: this.state.showLocation,
                                                locationPickerView: false
                                            }, function () {

                                            })
                                        }}>
                                        <Text style={styles.buttonpicker}>Cancel</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    </View >
                )
            } else {
                return (
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                            <View style={{height:50, justifyContent:'center'}}>
                                <Text style={styles.titlepicker}>
                                    {StringText.CALENDER_YEARVIEW_LOCATION_TITLE}
                                </Text>
                                </View>
                                <Picker
                                    selectedValue={this.state.selectLocation}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectLocation: itemValue })}>
                                   {SharedPreference.COMPANY_LOCATION.map((i, index) => (
                                        <Picker.Item key={index} numberOfLines={1} label={i.value} value={i.value} />
                                    ))}
                                </Picker>



                                {/* <View style={styles.alertDialogBox}> */}
                                <View style={{ flexDirection: 'row', height: 50 }}>
                                    <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                        onPress={() => {
                                            this.setState({

                                                locationPickerView: false
                                            }, function () {


                                            })
                                        }}>
                                        <Text style={styles.buttonpickerdownloadleft}>Cancel</Text>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1 }}></View>
                                    <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                        onPress={() => {
                                            //console.log('selectYear =>: ',this.state.selectYear);
                                            // this.state.showLocation = this.state.selectLocation
                                            this.getLocation();


                                        }}>
                                        <Text style={styles.buttonpickerdownloadright}>{StringText.CALENDER_YEARVIEW_ALERT_LOCATION_BUTTON}</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* <View style={styles.alertDialogBox}>
                                    <TouchableOpacity style={styles.button}
                                        onPress={() => {
                                            this.getLocation()
                                        }}>
                                        <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_ALERT_LOCATION_BUTTON}</Text>
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                        </View>
                    </View >
                )
            }
        }
    }


    onBack() {
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    onloadPDFFile = async () => {
        // console.log("codelocation",codelocation)
        let data = await CalendarPDFAPI(this.state.selectYear, codelocation)
        code = data[0]
        data = data[1]

        //////console.log("onLoadPDFFIle : ", data)
        if (code.SUCCESS == data.code) {
            
            if (data.data[0].filename == null || data.data[0].filename == 'undefined') {
                this.onLoadAlertDialog()
            } else {
                let pdfPath = data.data[0].link
                let filename = data.data[0].filename
                this.onDownloadPDFFile(pdfPath, filename)
            }
        } else {
            Alert.alert(
                StringText.CALENDAR_ALERT_PDF_TITLE_FAIL,
                StringText.CALENDAR_ALERT_PDF_DESC_FAIL,
                [{
                    text: 'OK', onPress: () => {
                        //////////console.log("cancel downlosad")
                        this.setState({
                            isLoadingPDF: false
                        })
                    }
                }],
                { cancelable: false }
            )
        }

    }
    requestPDFPermission = async () => {
        //console.log("requestPDFPermission")
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    'title': "Permission",
                    'message': 'External Storage Permission'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //console.log("You can use the WRITE_EXTERNAL_STORAGE")

                this.setState({
                    havePermission: true
                })
                this.onloadPDFFile()
            } else {
                this.onloadPDFFile()
                //console.log("WRITE_EXTERNAL_STORAGE permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }
    onLoadAlertDialog() {
        ////////////console.log("onLoadAlertDialog")
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

    onDownloadPDFFile = async (pdfPath, filename) => {
        let today = new Date()
            const _format = 'YYYY-MM-DD hh:mm:ss'
            const newdate = moment(today).format(_format).valueOf();
            SharedPreference.lastdatetimeinterval = newdate
        filename = "calendar_" + this.state.selectYear +'-'+this.state.showLocation+'-'+ newdate+ '.pdf'
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_WORKING_CALENDAR, SharedPreference.profileObject.client_token)
        //////console.log("Android ==> LoadPDFFile ==> filename  : ", filename);
        //////console.log("Android ==> LoadPDFFile ==> path  : ", RNFetchBlob.fs.dirs.DownloadDir + '/' + filename);
        //let pathToFile = RNFetchBlob.fs.dirs.DownloadDir + '/' + filename;
        let pathToFile = DocumentDirectoryPath + '/pdf/' + filename;
        if (Platform.OS === 'android') {
            this.downloadTask = RNFetchBlob
                .config({
                    // addAndroidDownloads: {
                    //     useDownloadManager: true,
                    //     notification: false,
                    //     path: pathToFile,
                    //     mime: 'application/pdf',
                    //     title: filename,
                    //     description: 'Downloading'
                    // },
                    path: pathToFile,
                    title: filename,

                    timeout: 15000,
                    overwrite: true
                })
                .fetch('GET', SharedPreference.CALENDER_DOWNLOAD + pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                //    console.log("Android ==> LoadPDFFile ==> Load Success  : ", resp.path);
                    if (this.state.isLoadingPDF == true) {
                        this.setState({ isLoadingPDF: false })

                        Alert.alert(
                            StringText.CALENDAR_ALERT_PDF_TITLE_SUCCESS,
                            StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_1 + filename + StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_2,
                            [{
                                text: 'OK', onPress: () => {
                                    // console.log("Android ==> LoadPDFFile ==> onPress  : ", resp.path());
                                    RNFetchBlob.android.actionViewIntent(resp.path(), 'application/pdf')
                                }
                            },
                            {
                                text: 'Cancel', onPress: () => {
                                }, style: 'cancel'
                            }
                            ],
                            { cancelable: false }
                        )
                    }
                })
                .catch((errorCode, errorMessage) => {
                    this.setState({ isLoadingPDF: false })
                    //////////console.log("Android ==> LoadPDFFile ==> Load errorCode  : ", errorCode);
                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [{
                            text: 'OK', onPress: () => {
                            }
                        }],
                        { cancelable: false }
                    )
                })


        } else {//iOS
            //////////console.log("loadPdf pdfPath : ", pdfPath)
            //////////console.log("loadPdf filename : ", filename)
            this.downloadTask = RNFetchBlob
                .config({
                    fileCache: true,
                    appendExt: 'pdf',
                    filename: filename,
                    timeout: 15000,
                    overwrite: true
                })
                .fetch('GET', SharedPreference.CALENDER_DOWNLOAD + pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                    //////////console.log('loadPdf ==> resp : ', resp)
                    if (this.state.isLoadingPDF == true) {
                        this.setState({ isLoadingPDF: false })
                        Alert.alert(
                            StringText.CALENDAR_ALERT_PDF_TITLE_SUCCESS,
                            StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_1 + filename + StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_2,
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        RNFetchBlob.ios.openDocument(resp.path());
                                    }
                                },
                                {
                                    text: 'Cancel', onPress: () => {
                                    }, style: 'cancel'
                                }
                            ],
                            { cancelable: false }
                        )
                    }
                })
                .catch((errorMessage, statusCode) => {

                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [{
                            text: 'OK', onPress: () => {
                            }
                        }],
                        { cancelable: false }
                    )
                });
        }
    }

    onSynWithCalendar = async () => {

        if (SharedPreference.isConnected) {

            await RNCalendarEvents.authorizeEventStore();

            await RNCalendarEvents.authorizationStatus().then(status => {
                if (status == 'authorized') {

                    Alert.alert(
                        StringText.CALENDER_YEARVIEW_SYNC_CALENDAR_TITLE,
                        StringText.CALENDER_YEARVIEW_SYNC_CALENDAR_BUTTON,
                        [
                            {
                                text: 'Cancel', onPress: () => {
                                    // this.deleteEventOnCalendar()
                                }, style: 'cancel'
                            },
                            {
                                text: 'OK', onPress: () => {
                                    //////console.log("start addEventOnCalendar")
                                    this.setState({
                                        isLoading: true
                                    })
                                    this.state.isLoading = true
                                    this.addEventOnCalendar()
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                }
            })
                .catch(() => this.setState({ calendarStatus: 'error' }));
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{
                    text: 'OK', onPress: () => {
                        this.setState({
                            isscreenloading: false,
                        });
                    }
                },
                ], { cancelable: false }
            )
        }
    }

    deleteEventOnCalendar = async () => {
        //////console.log("YearView ==> deleteEventCalendar")
        await this.eventCalendar._deleteEventCalendar(this.state.selectYear)
    }

    checkDuplicateEventCalendar = async (duplicateEventArray, newEventID) => {
        ////////console.log("checkDuplicateEventCalendar ==> checkDuplication ==> ", duplicateEventArray)
        ////////console.log("checkDuplicateEventCalendar ==> newEventID ==> ", newEventID)
        let checkFlag = false
        for (let index = 0; index < duplicateEventArray.length; index++) {
            const eventID = duplicateEventArray[index];
            if (eventID == newEventID) {
                checkFlag = true
            }
        }

        ////////console.log("checkDuplicateEventCalendar ==> checkFlag ==> ", checkFlag)
        if (checkFlag == false) {
            duplicateEventArray.push(newEventID)
            return [checkFlag, duplicateEventArray]
        }

        return [checkFlag, duplicateEventArray]

    }




    deleteEventCalendar = async () => {
        await this.eventCalendar._deleteEventCalendar(this.state.selectYear)

    }


    addEventOnCalendar = async () => {

        await this.eventCalendar._deleteEventCalendar(this.state.selectYear)

        let duplicateEventArray = []

        // //////console.log("addEventOnCalendar ==> this.state.calendarEventData ", this.state.calendarEventData.length)

        if (this.state.calendarEventData.code == 200) {
            let holidayArray = this.state.calendarEventData.data.holidays;
            // //////console.log("addEventOnCalendar ==> holidayArray ", holidayArray.length)
            // for (let index = 0; index < holidayArray.length; index++) {
            for (let index = 0; index < holidayArray.length; index++) {
                const daysArray = holidayArray[index].days
                for (let f = 0; f < daysArray.length; f++) {
                    const eventDetailArray = daysArray[f].events;
                    for (let k = 0; k < eventDetailArray.length; k++) {
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

                        if (eventObject.event_id != null) {

                            if (duplicateEventArray.length == 0) {
                                duplicateEventArray.push(eventObject.event_id)
                                await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);
                            } else {
                                let data = await this.checkDuplicateEventCalendar(duplicateEventArray, eventObject.event_id)
                                let checkFlag = data[0]
                                duplicateEventArray = data[1]
                                if (checkFlag == false) {
                                    await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);
                                }
                            }
                        } else {
                            await this.eventCalendar.synchronizeCalendar(eventObject, this.state.showLocation);
                        }
                        //////console.log("==============Success==============")
                    }
                }
            }

            this.setState({
                isLoading: false
            })

            if (this.state.isSycnCalendarFirstTime == false) {
                Alert.alert(
                    StringText.CALENDAR_ALERT_SYNC_CALENDAR_TITLE_SUCCESS,
                    StringText.CALENDAR_ALERT_SYNC_CALENDAR_DESC_SUCCESS,
                    [
                        {
                            text: StringText.CALENDAR_ALERT_SYNC_CALENDAR_BUTTON_SUCCESS, onPress: () => {
                                this.setState({
                                    isLoading: false
                                })
                            }
                        },
                    ],
                    { cancelable: false }
                )
            }

        } else {

            Alert.alert(
                StringText.CALENDAR_ALERT_SYNC_CALENDAR_TITLE_SUCCESS,
                StringText.CALENDAR_ALERT_SYNC_CALENDAR_DESC_SUCCESS,
                [
                    {
                        text: StringText.CALENDAR_ALERT_SYNC_CALENDAR_BUTTON_SUCCESS, onPress: () => {
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

    onCancelDownloadPDF() {
        this.setState({
            isLoadingPDF: false
        })
    }

    renderDownloadProgressView() {
        if (this.state.isLoadingPDF) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.alertDialogBackgroudAlpha} />
                    {/* bg */}
                    <View style={styles.alertDialogContainer}>
                        <View style={styles.calendarDownloadContrainer}>
                            <ActivityIndicator />
                        </View>
                        <TouchableOpacity style={[styles.calendarDownloadContrainer, { marginTop: 10 }]} onPress={(this.onCancelDownloadPDF.bind(this))}>
                            {/* <View > */}
                            <Text style={styles.calendarDownloadCancelText}>Cancel</Text>
                            {/* </View> */}
                        </TouchableOpacity>
                    </View>
                </View >
            )
        }
    }

    render() {
        return (
            <View style={styles.container} 
            collapsable={true}
            {...this.panResponder.panHandlers}
            >
                <View style={styles.container} >
                    <View style={styles.navContainer}>
                        <TouchableOpacity style={styles.navLeftContainer} onPress={(this.onBack.bind(this))}>
                            <Image
                                style={styles.navBackButton}
                                source={require('../resource/images/Back.png')}
                            />
                        </TouchableOpacity>
                        <Text style={styles.navTitleText}>Calendar</Text>
                        <View style={styles.navRightContainer}>
                            <TouchableOpacity onPress={this.onSynWithCalendar.bind(this)}
                            //style={{justifyContent:'center'}}
                            >
                                <Image
                                    style={styles.navRightButton}
                                    source={require('../resource/images/calendar_sync.png')}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                if (SharedPreference.isConnected) {
                                    this.setState({
                                        yearPickerForDownloadPDFFileView: true
                                    })
                                } else {
                                    Alert.alert(
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                                        [{
                                            text: 'OK', onPress: () => {
                                                this.setState({
                                                    isscreenloading: false,
                                                });
                                            }
                                        },
                                        ], { cancelable: false }
                                    )
                                }

                            }}>
                                <Image
                                    style={styles.navRightButton}
                                    source={require('../resource/images/PDFdownload.png')}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.detailContainer} >
                        <View style={styles.calendarTitleBox} >
                            <TouchableOpacity style={styles.calendarMonthTextLeftContainer} onPress={() => {
                                if (SharedPreference.isConnected) {

                                    this.setState({
                                        yearviewPicker: true
                                    })
                                } else {
                                    Alert.alert(
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                                        [{
                                            text: 'OK', onPress: () => {
                                                this.setState({
                                                    isscreenloading: false,
                                                });
                                            }
                                        },
                                        ], { cancelable: false }
                                    )
                                }

                            }}>
                                <Text style={styles.calendarYearText}>{this.state.showYear}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.calendarMonthTextRightContainer} onPress={() => {
                                if (SharedPreference.isConnected) {

                                    this.setState({
                                        locationPickerView: true
                                    })
                                } else {
                                    Alert.alert(
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                                        StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                                        [{
                                            text: 'OK', onPress: () => {
                                                this.setState({
                                                    isscreenloading: false,
                                                });
                                            }
                                        },
                                        ], { cancelable: false }
                                    )
                                }
                            }}>
                                <View style={styles.calendarCoverTitleBox}>
                                    <Text style={styles.calendarLocationText}>{this.state.showLocation}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {this.showAllMonthView()}
                    </View>
                    {/* {dialogview} */}
                </View >
                {this.renderDialog()}
                {this.renderProgressView()}
                {this.renderDownloadProgressView()}
            </View>
        );
    }
}


