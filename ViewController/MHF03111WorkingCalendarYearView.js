import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import Authorization from '../SharedObject/Authorization'

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
import firebase from 'react-native-firebase';

export default class calendarYearView extends Component {

    eventCalendar = new EventCalendar()
    SaveProfile = new SaveProfile()

    constructor(props) {
        super(props);
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
            selectLocation: this.props.navigation.getParam("location", "TA"),

            showYear: '',
            showLocation: '',

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

            havePermission: false,
            changeData: false,
            newPage: false,
            isLoadingPDF: false,

            page: this.props.navigation.getParam("page", 2),
            isSycnCalendarFirstTime: false,


        }

        //console.log("dataResponse :", this.state.dataResponse)
        this.LocaleConfig()
        this.getYearSelect()
        this.setNewPicker()
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_WORKING_CALENDAR)

    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    setNewPicker() {
        array = SharedPreference.COMPANY_LOCATION
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
        this.getYearSelect()
        this.getYearView(this.state.selectYear, this.state.dataResponse)
        if ((SharedPreference.calendarAutoSync == true) && (this.state.page == 1)) {
            this.addEventOnCalendar()
            this.setState({
                isSycnCalendarFirstTime: true,
                isLoading: true
            })
        }
    }

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
        await this.onLoadCalendarAPI(year, location)
    }

    onLoadCalendarAPI = async (year, location) => {
        //////console.log("onLoadCalendarAPI ====> year : ", year, " , location : ", location)
        //////console.log("location : ", this.state.selectLocation)

        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + year + '&company=' + location, SharedPreference.FUNCTIONID_WORKING_CALENDAR)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            //////console.log("onLoadCalendarAPI ====> SUCCESS")
            this.getYearView(this.state.selectYear, data)

        } else {
            Alert.alert(
                StringText.CALENDAR_ALERT_NO_DATA_TITLE,
                StringText.CALENDAR_ALERT_NO_DATA_DESC,
                [{
                    text: 'OK', onPress: () => {
                        //////console.log("cancel downlosad")
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
        //////console.log("getYearView : year ==> ", year)
        //////console.log("getYearView : calendarEventData ==> ", calendarEventData)

        let monthYear = 12
        const original = [];

        if (calendarEventData.code == 200) {
            for (let index = 0; index < monthYear; index++) {
                let object = this.getMonthEvent((index + 1), calendarEventData)
                original[index] = object
            }
        } else {

            // //////console.log("this.state.selectLocation : ", this.state.selectLocation)
            // showLocation = "Company"
            year = new Date().getFullYear()
        }

        if (this.state.selectLocation == null) {
            showLocation = await this.getFullLocation("TA")
        } else {

            showLocation = await this.getFullLocation(this.state.selectLocation)
        }

        //////console.log("getYearView : showLocation ==> ", showLocation)
        //////console.log("getYearView : year ==> ", year)

        this.showAllMonthView()
        this.setState({
            yearObject: original,
            showYear: year,
            isLoading: false,
            calendarEventData: calendarEventData,
            showLocation: showLocation,
            dataResponse: calendarEventData,
        })
    }

    getMonthEvent(month, calendarEventData) {
        yearObject = calendarEventData.data.holidays
        for (let index = 0; index < yearObject.length; index++) {
            const element = yearObject[index];
            if (element.month == month) {
                ////////////console.log("getMonthEvent yearObject ==> ", yearObject[index])
                return yearObject[index]
            }
        }
        return {
            "month": month,
            "days": []
        }
    }

    showAllMonthView() {
        //////console.log("Calendar ==> showAllMonthView")
        monthView = []
        monthView1 = []
        monthView2 = []
        monthView3 = []
        monthView4 = []
        month = 12 //month count


        for (let f = 0; f < month; f++) {

            let selectMonth = (f + 1)
            // //////console.log("Calendar ==> selectMonth : ", selectMonth)

            let monthText = this.state.showYear + '-' + selectMonth + '-01'
            if (selectMonth < 10) {
                monthText = this.state.showYear + '-0' + selectMonth + '-01'
            }
            // //////console.log("Calendar ==> monthText : ", monthText)
            this.state.countDay = []

            monthView.push(
                <TouchableOpacity key={f} style={styles.container}
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
                                    fontSize: 12,
                                    textAlign: 'left',
                                    color: Colors.calendarRedText,
                                }
                            }
                        }}

                        dayComponent={({ date, state }) => {
                            // //////console.log("selectedDateMonth dayComponent =====> : ", date)
                            // //////console.log("selectedDateMonth dayComponent =====> state : ", state)

                            this.state.countDay.push(date.day);
                            const selectedDateMonth = moment(date.dateString).format(_format);
                            let checkSpecialHoliday = this.checkSpecialHoliday(selectedDateMonth);
                            // //////console.log("selectedDateMonth =====> : ", selectedDateMonth)
                            // //////console.log("checkSpecialHoliday =====> ", checkSpecialHoliday)

                            if (checkSpecialHoliday == 'Y') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : Colors.calendarBlueText }}>
                                        {date.day}</Text>
                                </View>
                            } else if (checkSpecialHoliday == 'N') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : Colors.calendarRedText }}>
                                        {date.day}</Text>
                                </View>
                            } else if (checkSpecialHoliday == 'W') {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : Colors.calendarGrayText }}>
                                        {date.day}</Text>
                                </View>
                                //} else if ((this.state.countDay.length % 7) == 0 || (this.state.countDay.length % 7) == 1) {//Holiday
                                //              return <View style={styles.calendarDayContainer}>
                                //                <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : Colors.redTextColor }}>
                                //                  {date.day}</Text>
                                //s        </View>
                            } else if ((this.state.today.getDate() == date.day) && ((this.state.today.getMonth() + 1) == date.month)
                                && (this.state.today.getFullYear() == date.year)) {
                                return <View style={styles.calendarCurrentDayCicleContainer}>
                                    <View style={[styles.calendarCurrentDayCircle, { backgroundColor: state === 'disabled' ? 'white' : 'red' }]} />
                                    <Text style={styles.calendarCurrentDayText}>
                                        {date.day}</Text>
                                </View>
                            } else {
                                return <View style={styles.calendarDayContainer}>
                                    <Text style={{ fontSize: 10, textAlign: 'right', color: state === 'disabled' ? 'white' : 'black' }}>
                                        {date.day}</Text>
                                </View>
                            }
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
        ////////console.log("selectedDateMonth : ", selectedDateMonth)
        try {
            const month = moment(selectedDateMonth).format('M');
            ////////console.log("month : ", month)
            let checkObject = this.state.yearObject[(month - 1)]
            ////////console.log("checkObject : ", checkObject)

            if (checkObject == []) {
                return false
            }
            let objectMonth = checkObject.days
            ////////console.log("objectMonth : ", objectMonth)

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
        ////////console.log("datetime : ", datetime)
        const month = moment(datetime).format('M');
        let monthObject = this.state.yearObject[(month - 1)]
        //////console.log("onPressCalendar ==> ", monthObject)
        this.props.navigation.navigate('calendarMonthView',
            {
                month: datetime,
                monthObject: monthObject,
                dataResponse: this.state.dataResponse,
                location: this.state.selectLocation
            });
    }

    onPDF(year) {
        this.setState({
            selectYear: year
        })
    }

    onPressSelectYearWhenSelectPDF(year, i) {
        // //console.log('android select year => ', year, i)
        this.setState({
            selectYearPicker: year,
            yearPickerForDownloadPDFFileView: false,
            isLoadingPDF: true
        }, function () {

            this.onloadPDFFile();
        })
    }
    
    onPressSelectYearWhenSelectLocation(year, type) {
        this.setState({
            selectYear: year,
            yearviewPicker: false
        })

        this.state.yearviewPicker = false
        this.resetCalendar()
    }

    onPressLocation(locationFull, locationShort) {

        this.setState({
            selectLocation: locationShort
        })

        this.state.selectLocation = locationShort
        this.getLocation()

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
        //console.log("WorkingCalender ==> getLocation ==> ", location)
        if (Platform.OS === 'ios') {

            locationShort = await this.getShortLocation(this.state.selectLocation)
            if (locationShort == undefined) {
                locationShort = this.state.locationPicker[0].value
            }

            this.setState({
                selectLocation: locationShort
            })
        } else {
            this.setState({
                selectLocation: location
            })
        }

        //console.log("workingCalendar ==> getLocation : ", this.state.selectLocation)
        this.setState({
            locationPickerView: false,
            isLoading: true,
        })

        await this.openNewPage(this.state.selectLocation)
    }

    openNewPage = async (location) => {
        //console.log("openNewPage ==> ", location)
        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + this.state.selectYear + '&company=' + location, SharedPreference.FUNCTIONID_WORKING_CALENDAR)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {

            this.props.navigation.navigate('calendarYearView2', {
                dataResponse: data,
                selectYear: this.state.selectYear,
                location: location
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
                // //////console.log("this.state.yearsPickerArray : ", this.state.yearsPickerArray)
                return (
                    <View style={styles.alertDialogContainer}>
                        {/* bg */}
                        <View style={styles.alertDialogBackgroudAlpha} />
                        {/* bg */}
                        <View style={styles.alertDialogContainer}>
                            <View style={styles.alertDialogBoxContainer}>
                                <Text style={[styles.alertDialogBoxText, {
                                    style: Text,
                                }]}>{StringText.CALENDER_YEARVIEW_SELECT_YEAR_TITLE}</Text>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        this.state.yearsPickerArray.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                                onPress={() => { this.onPressSelectYearWhenSelectLocation(i.label) }}
                                                key={index + 100}>
                                                <View style={styles.pickerViewAndroidContrianer} key={index + 200}>
                                                    <Text style={styles.pickerViewAndroidText}> {i.label}</Text>
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
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
                                <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_SELECT_YEAR_TITLE}</Text>
                                <Picker
                                    selectedValue={this.state.selectYearPicker}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectYearPicker: itemValue })}>
                                    {this.state.yearsPickerArray.map((i, index) => (
                                        <Picker.Item key={index} color={Colors.redTextColor} label={i.label} value={i.value} />
                                    ))}
                                </Picker>
                                <View style={styles.alertDialogBox}>
                                    <TouchableOpacity style={styles.button}
                                        onPress={() => {
                                            this.setState({ yearviewPicker: false }),
                                                this.resetCalendar()
                                        }}>
                                        <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_SELECT_YEAR_BUTTON}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View >
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
                                <Text style={[styles.alertDialogBoxText, {
                                    style: Text,
                                }]}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_TITLE}</Text>
                                <View style={{height:20}}/>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        this.state.yearsPickerArray.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                                onPress={() => { this.onPressSelectYearWhenSelectPDF(i.label,i) }}
                                                >
                                                <View style={styles.pickerViewAndroidContrianer}>
                                                    <Text style={styles.alertDialogBoxSelectText}> {i.label}</Text>
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
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
                                <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_TITLE}</Text>
                                <Picker
                                    selectedValue={this.state.selectYearPicker}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectYearPicker: itemValue })}>
                                    {this.state.yearsPickerArray.map((i, index) => (
                                        <Picker.Item key={index} color={Colors.redTextColor} label={i.label} value={i.value} />
                                    ))}
                                </Picker>
                                <View style={styles.alertDialogBox}>
                                    <TouchableOpacity style={styles.button}
                                        onPress={() => {
                                            //console.log('selectYear =>: ',this.state.selectYear);
                                            this.setState({
                                                yearPickerForDownloadPDFFileView: false,
                                                isLoadingPDF: true
                                            },function(){
                                               this.onloadPDFFile();

                                            })
                                            
                                        }}>
                                        <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_DOWNLOAD_PDF_BUTTON}</Text>
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
                                <Text style={[styles.alertDialogBoxText, {
                                    style: Text,
                                }]}>{StringText.CALENDER_YEARVIEW_LOCATION_TITLE}</Text>
                                <ScrollView style={{ height: '40%' }}>
                                    {
                                        this.state.locationPicker.map((i, index) => (
                                            <TouchableOpacity style={styles.button}
                                                onPress={() => { this.onPressLocation(i.label, i.value) }}
                                                key={index + 100}>
                                                <View style={styles.pickerViewAndroidContrianer} key={index + 200}>
                                                    <Text style={styles.pickerViewAndroidText}> {i.label}</Text>
                                                </View>
                                            </TouchableOpacity>))}
                                </ScrollView>
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
                                <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_LOCATION_TITLE}</Text>
                                <Picker
                                    selectedValue={this.state.selectLocation}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ selectLocation: itemValue })}>
                                    {this.state.locationPicker.map((i, index) => (
                                        <Picker.Item key={index} numberOfLines={1} color={Colors.redTextColor} label={i.label} value={i.label} />
                                    ))}
                                </Picker>
                                <View style={styles.alertDialogBox}>
                                    <TouchableOpacity style={styles.button}
                                        onPress={() => {
                                            this.getLocation()
                                        }}>
                                        <Text style={[styles.alertDialogBoxText, { style: Text }]}>{StringText.CALENDER_YEARVIEW_ALERT_LOCATION_BUTTON}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View >
                )
            }
        }
    }

    onBack() {
        this.props.navigation.navigate('HomeScreen');
    }

    onloadPDFFile = async () => {
        //console.log("onloadPDFFile",this.state.selectYearPicker)
        let data = await CalendarPDFAPI(this.state.selectYearPicker, this.state.selectLocation)
        code = data[0]
        data = data[1]

        //console.log("onLoadPDFFIle : ", data)
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
                        //////console.log("cancel downlosad")
                        this.setState({
                            isLoadingPDF: false
                        })
                    }
                }],
                { cancelable: false }
            )
        }

    }

    onLoadAlertDialog() {
        ////////console.log("onLoadAlertDialog")
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
        filename = "calendar_" + this.state.selectYearPicker + '.pdf'
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_WORKING_CALENDAR, SharedPreference.profileObject.client_token)
        //console.log("Android ==> LoadPDFFile ==> filename  : ", filename);
        //console.log("Android ==> LoadPDFFile ==> path  : ", RNFetchBlob.fs.dirs.DownloadDir + '/' + filename);
        let pathToFile = RNFetchBlob.fs.dirs.DownloadDir + '/' + filename;
        if (Platform.OS === 'android') {
            this.downloadTask = RNFetchBlob
                .config({
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: false,
                        path: pathToFile,
                        mime: 'application/pdf',
                        title: filename,
                        description: 'Downloading'
                    },


                    timeout: 15000,
                    overwrite: true
                })
                .fetch('GET', SharedPreference.HOST + pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                   //console.log("Android ==> LoadPDFFile ==> Load Success  : ", resp.path);
                    if (this.state.isLoadingPDF == true) {
                        this.setState({ isLoadingPDF: false })

                        Alert.alert(
                            StringText.CALENDAR_ALERT_PDF_TITLE_SUCCESS,
                            StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_1 + filename + StringText.CALENDAR_ALERT_PDF_DESC_SUCCESS_2,
                            [{
                                text: 'OK', onPress: () => {
                                    //console.log("Android ==> LoadPDFFile ==> onPress  : ", resp.data);
                                    RNFetchBlob.android.actionViewIntent(resp.data, 'application/pdf')
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
                    //////console.log("Android ==> LoadPDFFile ==> Load errorCode  : ", errorCode);
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
            //////console.log("loadPdf pdfPath : ", pdfPath)
            //////console.log("loadPdf filename : ", filename)
            this.downloadTask = RNFetchBlob
                .config({
                    fileCache: true,
                    appendExt: 'pdf',
                    filename: filename,
                    timeout: 15000,
                    overwrite: true
                })
                .fetch('GET', SharedPreference.HOST + pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                    //////console.log('loadPdf ==> resp : ', resp)
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
                        //console.log("start addEventOnCalendar")
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

    deleteEventOnCalendar = async () => {
        //console.log("YearView ==> deleteEventCalendar")
        await this.eventCalendar._deleteEventCalendar(this.state.selectYear)
    }

    checkDuplicateEventCalendar = async (duplicateEventArray, newEventID) => {
        ////console.log("checkDuplicateEventCalendar ==> checkDuplication ==> ", duplicateEventArray)
        ////console.log("checkDuplicateEventCalendar ==> newEventID ==> ", newEventID)
        let checkFlag = false
        for (let index = 0; index < duplicateEventArray.length; index++) {
            const eventID = duplicateEventArray[index];
            if (eventID == newEventID) {
                checkFlag = true
            }
        }

        ////console.log("checkDuplicateEventCalendar ==> checkFlag ==> ", checkFlag)
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

        // //console.log("addEventOnCalendar ==> this.state.calendarEventData ", this.state.calendarEventData.length)

        if (this.state.calendarEventData.code == 200) {
            let holidayArray = this.state.calendarEventData.data.holidays;
            // //console.log("addEventOnCalendar ==> holidayArray ", holidayArray.length)
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
                                timeEnd = daysArray[f].date + ' 10:59:00'
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
                        //console.log("==============Success==============")
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
            <View style={styles.container} >
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
                                //////////////console.log("yearPickerForDownloadPDFFileView");
                                this.setState({
                                    yearPickerForDownloadPDFFileView: true
                                })
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
                                this.setState({
                                    yearviewPicker: true
                                })
                            }}>
                                <Text style={styles.calendarYearText}>{this.state.showYear}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.calendarMonthTextRightContainer} onPress={() => {
                                this.setState({
                                    locationPickerView: true
                                })
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


