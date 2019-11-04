import React, { Component } from "react";
import {
    View, Text, TouchableOpacity, Picker,
    Image, Switch, ActivityIndicator, ScrollView,
    RefreshControl, Alert, NetInfo,
    Platform, Dimensions, BackHandler, StatusBar,PanResponder,
    SafeAreaView,Linking, If
} from "react-native";

import { styles } from "../SharedObject/MainStyles";
import Colors from "../SharedObject/Colors"
import SharedPreference from "../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"
import SignOutAPI from "../constants/SignOutAPI"
import DeviceInfo from 'react-native-device-info';
import SaveAutoSyncCalendar from "../constants/SaveAutoSyncCalendar";
import SaveProfile from "../constants/SaveProfile"
import SaveTimeNonPayroll from "../constants/SaveTimeNonPayroll"
import StringText from '../SharedObject/StringText';
import firebase from 'react-native-firebase';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import EventCalendar from "../constants/EventCalendar"
import RNCalendarEvents from 'react-native-calendar-events';

var BadgeAndroid = require('react-native-android-badge')
let scale = Layout.window.width / 320;
const ROLL_ANNOUNCE = 50;
let focealert = false;

let annountype = { 'All': 'All', 'Company Announcement': 'Company Announcement', 'Emergency Announcement': 'Emergency Announcement', 'Event Announcement': 'Event Announcement', 'General Announcement': 'General Announcement' };
let announstatus = { 'All': 'All', 'true': 'Read', 'false': 'Unread' };

let announcementpicker =  [ { value: 'All', key: 'All' },{ value: 'Company Announcement', key: 'Company Announcement' },
{ value: 'Emergency Announcement', key: 'Emergency Announcement' },
{ value: 'Event Announcement', key: 'Event Announcement' },
{ value: 'General Announcement', key: 'General Announcement' } ];

let announstatuspicker =  [ { value: 'All', key: 'All' },{ value: 'Unread', key: 'Unread' }, { value: 'Read', key: 'Read' } ];


let ICON_SIZE = '60%';
let expandheight = 0;
let announcementData = [];
let tempannouncementData = [];
let ascendingSort = false;
let filterImageButton = require('./../resource/images/filter.png');
let sortImageButton = require('./../resource/images/descending.png');

//let initannouncementType = 'All';
let initannouncementTypetext = 'All';
//let initannouncementStatus = 'All';
let initannouncementStatustext = 'All'
let page = 0;
let orgcode = '';//60162305;

let managerstatus = 'N';
let announcestatus = 'N';
let settingstatus = 'N';

let rolemanagementEmpoyee = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let rolemanagementManager = [0, 0, 0, 0];
let timerstatus = false;
let viewupdate = false;
//let tempannouncementStatus=0;
let sessionTimeoutSec = 10000;

let readyExit = false
import moment from 'moment'

import Authorization from "../SharedObject/Authorization";
import Layout from "../SharedObject/Layout";

export default class HMF01011MainView extends Component {

    saveAutoSyncCalendar = new SaveAutoSyncCalendar()
    saveProfile = new SaveProfile()
    saveTimeNonPayroll = new SaveTimeNonPayroll()
    eventCalendar = new EventCalendar()
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

        this.state = {
            // isscreenloading: true,
            syncCalendar: true,

            announcementTypetext: initannouncementTypetext,

            announcementStatustext: initannouncementStatustext,

            refreshing: false,
            loadmore: false,
            announcepage: 0,
            enddragannounce: false,
            annrefresh: true,
            username: SharedPreference.profileObject.employee_name,
            nonPayrollBadge: [],
            announcetypelist: ['All', 'Company Announcement', 'Emergency Announcement', 'Event Announcement', 'General Announcement'],
            announcestatuslist: ['All', 'Read', 'Unread'],
            tempannouncementType: 'All',
            initannouncementType: 'All',
            announcementType: 'All',
            tempannouncementStatus: 'All',
            initannouncementStatus: 'All',
            announcementStatus: 'All',
            // SharedPreference.READ_TYPE

            notiAnnounceMentBadge: SharedPreference.notiAnnounceMentBadge,
            notiPayslipBadge: SharedPreference.notiPayslipBadge.length,
            nonPayslipBadge: SharedPreference.nonPayslipBadge.length,
            nonPayrollBadgeFirstTime: true,
            loadingannouncement: false,
            //  page: 0
            select_announcement_type: 0,
            select_announcement_status: 0,
            sendlastupdate: SharedPreference.lastdatetimeinterval,
            Sessiontimeout:0,
            application_device: SharedPreference.APPLICATION_DEVICE
        }


        rolemanagementEmpoyee = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        rolemanagementManager = [0, 0, 0, 0];
        managerstatus = 'N';
        announcestatus = 'N';
        settingstatus = 'N';
        
        for (let i = 0; i < SharedPreference.profileObject.role_authoried.length; i++) {

            if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0401') {

                rolemanagementEmpoyee[0] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0601') {

                rolemanagementEmpoyee[1] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0501') {

                rolemanagementEmpoyee[2] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0901') {

                rolemanagementEmpoyee[3] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0701') {

                rolemanagementEmpoyee[4] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0801') {

                rolemanagementEmpoyee[5] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0311') {

                rolemanagementEmpoyee[6] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0A01') {

                rolemanagementEmpoyee[7] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0B01') {

                rolemanagementEmpoyee[8] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0201') {

                announcestatus = 'Y'

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0C11') {

                managerstatus = 'Y'

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0C21') {

                rolemanagementManager[0] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0C31') {

                rolemanagementManager[1] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0C41') {

                rolemanagementManager[2] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0C51') {

                rolemanagementManager[3] = 1

            } else if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0151') {

                settingstatus = 'Y'
            }
        }

    }

    componentDidUpdate() {
        // console.log('mainview componentDidUpdate')
        // if (!SharedPreference.userRegisted) {
        //     this.props.navigation.navigate('RegisterScreen')
        //     SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
        // }
    }

    componentWillMount() {

        page = 0;
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN
        SharedPreference.Sessiontimeout = 0;

        // this.interval = setInterval(() => {
        this.setState({
            isscreenloading: false
        })
        // }, 1000);
        // this.notificationListener();

        if (SharedPreference.nonPayslipBadge.length) {
            this.setState({
                nonPayslipBadge: 0
            })
        }
        if (SharedPreference.notiPayslipBadge.length) {
            this.setState({
                notiPayslipBadge: 0
            })
        }

        if (Platform.OS !== 'android') return

        BackHandler.addEventListener('hardwareBackPress', () => {

            BackHandler.exitApp()
         
            return true
        })
  
        
    }
    resetTimer() {
 
        this.timersession = setTimeout(() => this.setState({
            // glass: true
        }, function () {
            if (!SharedPreference.sessionTimeoutBool) {
                SharedPreference.sessionTimeoutBool = true
                Alert.alert(

                    StringText.ALERT_SESSION_TIMEOUT_TITILE,
                    StringText.ALERT_SESSION_TIMEOUT_DESC,
                    [{
                        text: 'OK', onPress: () => {
                        
                            this.props.navigation.navigate('PinScreen')
                            SharedPreference.userRegisted = false;
                            page = 0
                            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER

                        }
                    }],
                    { cancelable: false }
                )
            }
  

        }), sessionTimeoutSec)
    }

    handleBackButtonClick() {

        return true;
    }

    loadData = async () => {

        this.setState({
            syncCalendar: false,
        })
        let autoSyncCalendarBool = await this.saveAutoSyncCalendar.getAutoSyncCalendar()

        await RNCalendarEvents.authorizationStatus().then(status => {

            if (status == 'authorized') {

               SharedPreference.autoSyncCalendarBool = autoSyncCalendarBool;
               SharedPreference.calendarSyncStatus = true;

            } else {

                SharedPreference.calendarSyncStatus = false;
                SharedPreference.autoSyncCalendarBool = false;
            }

        })

        this.onLoadInAppNoti()
        this.onloadSessiontimeout();
    }

    componentDidMount() {

        if (SharedPreference.notipayslipID) {

            this.onOpenPayslipDetail()

        } else if (SharedPreference.notiAnnounceMentID) {

            this.onOpenAnnouncementDetailnoti()

        }

        this.loadData()

        this.notificationListener(parseInt(SharedPreference.notiAnnounceMentBadge) + SharedPreference.notiPayslipBadge.length + SharedPreference.nonPayslipBadge.length);
    }

    componentWillUnmount() {
   
        clearTimeout(this.timer);
        clearTimeout(this.timersession);

        SharedPreference.notiAnnounceMentBadge = this.state.notiAnnounceMentBadge;

    }

    onloadSessiontimeout(){
        SharedPreference.Sessiontimeout = SharedPreference.Sessiontimeout + 1

        if (SharedPreference.Sessiontimeout >= SharedPreference.SessiontimeoutSec) {

            if (SharedPreference.userRegisted) {
                Alert.alert(
                    StringText.ALERT_SESSION_TIMEOUT_TITILE,
                    StringText.ALERT_SESSION_TIMEOUT_DESC,
                    [{
                        text: 'OK', onPress: () => {
                            if (SharedPreference.userRegisted) {
                                SharedPreference.Sessiontimeout = 0
                                this.props.navigation.navigate('PinScreen')
                                page = 0
                                SharedPreference.userRegisted = false;
                                SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                            }
                        }
                    }], { cancelable: false }
                )
            }


        } else {
            console.log('SharedPreference.Sessiontimeout =>',SharedPreference.Sessiontimeout,SharedPreference.userRegisted)
            this.setState({
                Sessiontimeout:SharedPreference.Sessiontimeout
            })
            this.timersession = setTimeout(() => {

                clearTimeout(this.timersession)
                this.onloadSessiontimeout()
            }, 1000);

        }



    }
    onupdatebadgeAnnouncement = async () => {
     
        
        let urlPullnoti = SharedPreference.PULL_NOTIFICATION_NODATE_API
        if (SharedPreference.lastdatetimeinterval) {

            urlPullnoti = SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval
        }

        this.setState({
            sendlastupdate: SharedPreference.lastdatetimeinterval
        })
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)

        return fetch(urlPullnoti, {

            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: FUNCTION_TOKEN,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {

                try {
       
                    if (responseJson.status == 403) {

                        this.onAutenticateErrorAlertDialog()

                    } else if (parseInt(responseJson.status) == 401) {

                        this.onRegisterErrorAlertDialog()

                    } else if (responseJson.status == 200) {
                        
                        //update time request
                        SharedPreference.lastdatetimeinterval = responseJson.meta.request_date;

                        let dataArray = responseJson.data

                        this.setState({

                            // notiAnnounceMentBadge: parseInt(dataReceive.badge_count) + parseInt(this.state.notiAnnounceMentBadge)
                            notiAnnounceMentBadge: parseInt(0),
                            // nonPayslipBadge: parseInt(0),
                            // notiPayslipBadge: parseInt(0),
                        })

                        this.notificationListener(0);
                        
                        for (let index = 0; index < dataArray.length; index++) {
                            const dataReceive = dataArray[index];
                

                           if (dataReceive.function_id == "PHF02010") {
                            
                                this.setState({

                                    notiAnnounceMentBadge: parseInt(dataReceive.badge_count)

                                }, function () {

                                    SharedPreference.notiAnnounceMentBadge = this.state.notiAnnounceMentBadge
                                })

                            } 

                        }

                        this.notificationListener(parseInt(SharedPreference.notiAnnounceMentBadge) + SharedPreference.notiPayslipBadge.length + SharedPreference.nonPayslipBadge.length);

                    } 

                } catch (error) {
                    //console.log('erreo1 :', error);
                }
            })
            .catch((error) => {

                //console.log('error :', error)

            });

    }

    onLoadInAppNoti = async () => {

        let urlPullnoti = SharedPreference.PULL_NOTIFICATION_NODATE_API

        if (SharedPreference.lastdatetimeinterval) {

            urlPullnoti = SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval
            // urlPullnoti = SharedPreference.PULL_NOTIFICATION_API + '2018-12-12 14:40:25'
        }

        this.setState({
            sendlastupdate: SharedPreference.lastdatetimeinterval
            // sendlastupdate: '2018-12-12 14:40:25'
        })
     
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)
    
        return fetch(urlPullnoti, {

            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: FUNCTION_TOKEN,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {

                try {

                    if (responseJson.status == 403) {

                        this.onAutenticateErrorAlertDialog()

                    } else if (parseInt(responseJson.status) == 401) {

                        this.onRegisterErrorAlertDialog()

                    } else if (responseJson.status == 200) {

                        this.timer = setTimeout(() => {
                       
                            this.onLoadInAppNoti()
                            this.onLoadAppInfo()

                        }, SharedPreference.timeinterval);

                        //update time request
                        SharedPreference.lastdatetimeinterval = responseJson.meta.request_date;

                        let dataArray = responseJson.data

                        this.setState({

                            // notiAnnounceMentBadge: parseInt(dataReceive.badge_count) + parseInt(this.state.notiAnnounceMentBadge)
                            notiAnnounceMentBadge: parseInt(0),
                            // nonPayslipBadge: parseInt(0),
                            // notiPayslipBadge: parseInt(0),
                        })

                        this.notificationListener(0);

                        for (let index = 0; index < dataArray.length; index++) {
                            const dataReceive = dataArray[index];
                

                            if (dataReceive.function_id == "PHF06010") {//if nonPayroll

       
                                this.setState({

                                    nonPayslipBadge: parseInt(dataReceive.badge_count) + SharedPreference.nonPayslipBadge.length

                                }, function () {
                                    dataReceive.data_list.map((item, i) => {

                                        SharedPreference.nonPayslipBadge.push(item)
                                        // = dataReceive.data_list

                                    })
                                })
                               

                            } else if (dataReceive.function_id == "PHF02010") {

                                this.setState({

                                    notiAnnounceMentBadge: parseInt(dataReceive.badge_count)

                                }, function () {

                                    SharedPreference.notiAnnounceMentBadge = this.state.notiAnnounceMentBadge
                                })

                            } else if (dataReceive.function_id == 'PHF05010') {
          
                                this.setState({
                                    notiPayslipBadge: parseInt(dataReceive.badge_count) + SharedPreference.notiPayslipBadge.length
                                }, function () {
                                    dataReceive.data_list.map((item, i) => {

                                        SharedPreference.notiPayslipBadge.push(item)
        

                                    })
                                })
               
                            }

                        }

                        this.notificationListener(parseInt(SharedPreference.notiAnnounceMentBadge) + SharedPreference.notiPayslipBadge.length + SharedPreference.nonPayslipBadge.length);

                    } else {

                        this.timer = setTimeout(() => {
                          
                            this.onLoadInAppNoti()
                            this.onLoadAppInfo()

                        }, SharedPreference.timeinterval);

                    }

                } catch (error) {
              
                }
            })
            .catch((error) => {

              

            });


    }

    onLoadAppInfo = async () => {
        
        let data = await RestAPI(SharedPreference.APPLICATION_INFO_API, "1")
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            let appversion = '1.0.0'
            if (Platform.OS === 'android') {
                if (data.data.android.force_update === 'Y') {
                    if (data.data.android.app_version != SharedPreference.deviceInfo.appVersion) {
                        this.props.navigation.navigate('PinScreen')

                        clearTimeout(this.timer);

                        Alert.alert(
                            'New Version Available',
                            'This is a newer version available for download! Please update the app by visiting the Play Store',
                            [
                                {
                                    text: 'Update', onPress: () => {
                                        Linking.openURL("https://play.google.com/store/apps/details?id=com.tdem.stmconnectdev&hl=en");
                                        // Linking.openURL("https://play.google.com/store/apps/details?id=com.tdem.tdemconnectdev&hl=th&ah=HZ_1qJI8z-iAdQaRwublugkbqPE");
                                    }
                                }
                            ],
                            { cancelable: false }
                        )
                    }
                }
            } else {

                if (data.data.ios.force_update === 'Y') {
                    if (data.data.ios.app_version != SharedPreference.deviceInfo.appVersion) {
                        this.props.navigation.navigate('PinScreen')

                        clearTimeout(this.timer);

                        Alert.alert(
                            'New Version Available',
                            'This is a newer version available for download! Please click Update',
                            [
                                {
                                    text: 'Update', onPress: () => {
                                        // Linking.openURL("https://www.technobrave.asia/tdemios/");
                                        // Linking.openURL("https://www.technobrave.asia/tdemiosdev/");
                                       Linking.openURL("https://smart.ap.toyota-asia.com/tdemconnect/");

                                    }
                                }
                            ],
                            { cancelable: false }
                        )
                    }
                }
            }
        }

    }


    _loadResourcesAsync = async () => {
        return Promise.all([
            Asset.loadAsync([
                require('./../resource/images/icon.png'),
            ]),
        ]);
    };

    _onRefresh() {
        if (this.state.refreshing) {
            return;
        }
        page = 1;

        this.setState({
            loadingtype: 3,
            isscreenloading: true,
            refreshing: true,
            annrefresh: true,

        }, function () {

            let promise = this.loadAnnouncementfromAPI();

            if (!promise) {
                return;
            }

            promise.then(() => this.setState({
                refreshing: false
            }));
        });
    }

    _onLoadMore() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3,
                loadmore: true,

            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadAnnouncementMorefromAPI()
            
            });
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }

    }

    loadAnnouncementfromAPI = async () => {

        let totalroll = announcementData.length;
        if (this.state.annrefresh) {
            totalroll = ROLL_ANNOUNCE;
        } else if (!totalroll) {
            totalroll = ROLL_ANNOUNCE
        }

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_ANNOUCEMENT, SharedPreference.profileObject.client_token)
 
        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=0&limit=' + totalroll
        if (ascendingSort) {
            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=0&limit=' + totalroll
        }
      
        return fetch(hostApi, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: FUNCTION_TOKEN,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {
                try {
                    //console.log('responseJson: ', responseJson)
                    this.setState({
                        isscreenloading: false,
                        dataSource: responseJson,
                        announcepage: 0,
                        annrefresh: false
                    }, function () {
                        this.state.loadingannouncement = true
                        console.log("loadAnnouncementfromAPI responseJson => ", responseJson)
                        if (responseJson.status === 200) {
                            this.setState(this.renderloadingscreen());

                            // console.log('this.state.dataSource.data: ', responseJson.data)
                            // this.setState({
                            //     notiAnnounceMentBadge: 0
                            // })
                            this.notificationListener(this.state.notiAnnounceMentBadge);
                            tempannouncementData = []
                            announcementData = responseJson.data;
                            announcementData.map((item, i) => {
                                if (this.state.announcementStatus === 'All') {
                                    if (this.state.announcementType === 'All') {
                                        tempannouncementData.push(item)
                                    } else {
                                        if (item.category === this.state.announcementType) {
                                            tempannouncementData.push(item)
                                        }
                                    }
                                } else {
                                    if (item.attributes.read === this.state.announcementStatus) {
                                        if (this.state.announcementType === 'All') {
                                            tempannouncementData.push(item)
                                        } else {
                                            if (item.category === this.state.announcementType) {
                                                tempannouncementData.push(item)
                                            }
                                        }
                                    }
                                }
                            });
                            this.setState(this.renderannouncementbody());

                        } else if (parseInt(responseJson.status) == 401) {

                            this.onRegisterErrorAlertDialog()

                        } else if (responseJson.status === 403) {

                            this.onAutenticateErrorAlertDialog()

                        } else {
                            Alert.alert(
                                responseJson.errors[0].code,
                                responseJson.errors[0].detail,
                                [
                                    {
                                        text: 'OK', onPress: () => {
                                            //console.log('OK Pressed') },
                                        }
                                    }
                                ],
                                { cancelable: false }
                            )
                        }
                    });
                } catch (error) {
                    // TODO Error
                }
            })
            .catch((error) => {
                this.setState({
                    isscreenloading: false,
                }, function () {
                    this.setState(this.renderloadingscreen());
                    // TODO Error
                    this.onLoadErrorAlertDialog(error, 'Announcement')
                });
            });
    }

    loadAnnouncementMorefromAPI = async () => {

        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        if (ascendingSort) {
            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        }

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_ANNOUCEMENT, SharedPreference.profileObject.client_token)

        return fetch(hostApi, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: FUNCTION_TOKEN,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {
                try {
                    this.setState({
                        isscreenloading: false,
                        dataSource: responseJson,
                        announcepage: this.state.announcepage + 1,
                        loadmore: false
                    }, function () {

                        if (this.state.dataSource.status === 200) {

                            this.setState(this.renderloadingscreen());

                            this.state.dataSource.data.map((item, i) => {

                                announcementData.push(item)
                                if (this.state.announcementStatus === 'All') {
                                    if (this.state.announcementType === 'All') {
                                        tempannouncementData.push(item)
                                    } else {
                                        if (item.category === this.state.announcementType) {
                                            tempannouncementData.push(item)
                                        }
                                    }
                                } else {
                                    if (item.attributes.read === this.state.announcementStatus) {
                                        if (this.state.announcementType === 'All') {
                                            tempannouncementData.push(item)
                                        } else {
                                            if (item.category === this.state.announcementType) {
                                                tempannouncementData.push(item)
                                            }
                                        }
                                    }
                                }
                            });
                            this.setState(this.renderannouncementbody());

                        } else if (parseInt(responseJson.status) == 401) {

                            this.onRegisterErrorAlertDialog()

                        } else if (this.state.dataSource.status === 403) {

                            this.onAutenticateErrorAlertDialog()

                        } else {

                            this.setState(this.renderannouncementbody());
                        }
                    });
                } catch (error) {
                    // TODO Error
                }
            })
            .catch((error) => {
                this.setState({
                    isscreenloading: false,
                }, function () {
                    this.setState(this.renderloadingscreen());
                    // TODO Error
                    this.onLoadErrorAlertDialog(error, 'announcement')
                });
            });
    }



    temploadAnnouncementfromAPI = async () => {

        let totalroll = announcementData.length;

        if (this.state.annrefresh) {

            totalroll = ROLL_ANNOUNCE;

        } else if (!totalroll) {

            totalroll = ROLL_ANNOUNCE
        }

        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE

        if (ascendingSort) {

            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        }

        this.APIAnnouncementListCallback(await RestAPI(hostApi, SharedPreference.FUNCTIONID_ANNOUCEMENT),
            'AnnouncementDetail', 0)

    }

    temploadAnnouncementMorefromAPI = async () => {
        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        if (ascendingSort) {
            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        }

        this.APIAnnouncementListMoreCallback(await RestAPI(hostApi, SharedPreference.FUNCTIONID_ANNOUCEMENT),
            'AnnouncementDetail', 0)


    }

    APIAnnouncementListCallback(data, rount, index) {
        code = data[0]
        data = data[1]
        this.setState({

            isscreenloading: false,

        })

        if (code.SUCCESS == data.code) {
            this.setState(this.renderloadingscreen());
            // console.log('this.state.dataSource.data: ', responseJson.data)
            // this.setState({
            //     notiAnnounceMentBadge: 0
            // })
            this.notificationListener(this.state.notiAnnounceMentBadge)
            tempannouncementData = []
            announcementData = responseJson.data;
            announcementData.map((item, i) => {
                if (this.state.announcementStatus === 'All') {
                    if (this.state.announcementType === 'All') {
                        tempannouncementData.push(item)
                    } else {
                        if (item.category === this.state.announcementType) {
                            tempannouncementData.push(item)
                        }
                    }
                } else {
                    if (item.attributes.read === this.state.announcementStatus) {
                        if (this.state.announcementType === 'All') {
                            tempannouncementData.push(item)
                        } else {
                            if (item.category === this.state.announcementType) {
                                tempannouncementData.push(item)
                            }
                        }
                    }
                }
            });
            this.setState(this.renderannouncementbody());

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }

    }

    APIAnnouncementListMoreCallback(data, rount, index) {
        console.log('APIAnnouncementListCallback ==> data ==> ', data)
        code = data[0]
        data = data[1]

        this.setState({

            isscreenloading: false,
            dataSource: responseJson,
            announcepage: this.state.announcepage + 1,
            loadmore: false
        })

        if (code.SUCCESS == data.code) {
            this.setState(this.renderloadingscreen());

            this.state.dataSource.data.map((item, i) => {

                announcementData.push(item)
                if (this.state.announcementStatus === 'All') {
                    if (this.state.announcementType === 'All') {
                        tempannouncementData.push(item)
                    } else {
                        if (item.category === this.state.announcementType) {
                            tempannouncementData.push(item)
                        }
                    }
                } else {
                    if (item.attributes.read === this.state.announcementStatus) {
                        if (this.state.announcementType === 'All') {
                            tempannouncementData.push(item)
                        } else {
                            if (item.category === this.state.announcementType) {
                                tempannouncementData.push(item)
                            }
                        }
                    }
                }
            });
            this.setState(this.renderannouncementbody());

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }

    }

    loadAnnouncementDetailfromAPINoti = async () => {
        //console.log("loadAnnouncementDetailfromAPINoti")
        this.APIAnnouncementDetailCallback(await RestAPI(SharedPreference.ANNOUNCEMENT_DETAIL_API + SharedPreference.notiAnnounceMentID, SharedPreference.FUNCTIONID_ANNOUCEMENT),
            'AnnouncementDetail', 0)

        //   SharedPreference.notipayAnnounceMentID = 0
    }

    loadAnnouncementDetailfromAPI = async (item, index) => {

        this.APIAnnouncementDetailCallback(await RestAPI(SharedPreference.ANNOUNCEMENT_DETAIL_API + item.id, SharedPreference.FUNCTIONID_ANNOUCEMENT),
            'AnnouncementDetail', index)

    }

    APIAnnouncementDetailCallback(data, rount, index) {

        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {

            if (tempannouncementData.length) {

                if (tempannouncementData[index].attributes.read == false) {
                    tempannouncementData[index].attributes.read = true
                    this.onupdatebadgeAnnouncement()
                }
                
            }

            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
            });

            SharedPreference.notipayAnnounceMentID = 0;

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }
        this.setState({

            isscreenloading: false,

        })
    }

    loadEmployeeInfoformAPI = async () => {

        this.APICallback(await RestAPI(SharedPreference.EMP_INFO_CAREERPATH_API, SharedPreference.FUNCTIONID_EMPLOYEE_INFORMATION), 'EmployeeInfoDetail')

    }

    loadNonpayrollfromAPI = async () => {

        let data = await RestAPI(SharedPreference.NONPAYROLL_SUMMARY_API, SharedPreference.FUNCTIONID_NON_PAYROLL)
        code = data[0]
        data = data[1]
   
        this.setState({
            isscreenloading: false,
        })
        if (code.SUCCESS == data.code) {
            // let today = new Date()
            // const _format = 'YYYY-MM-DD hh:mm:ss'
            // const nowDateTime = moment(today).format(_format).valueOf();
            // this.saveTimeNonPayroll.setTimeStamp(nowDateTime)
            // console.log("non payroll dataSource ==> ", data.data)
            // this.props.navigation.navigate('NonPayrollList', {
            //     dataResponse: data.data,
            //     badgeArray: this.state.nonPayrollBadge
            // });
           
            this.props.navigation.navigate('NonPayrollList', {
                DataResponse: data.data,
                indexselectyear: 1
            });

            this.setState({
                nonPayslipBadge : 0
            })
          

        } else if (code.NODATA == data.code) {

            // let today = new Date()
            // const _format = 'YYYY-MM-DD hh:mm:ss'
            // const nowDateTime = moment(today).format(_format).valueOf();
            // this.saveTimeNonPayroll.setTimeStamp(nowDateTime)
          
            this.props.navigation.navigate('NonPayrollList', {
                badgeArray: this.state.nonPayrollBadge,
                indexselectyear: 1
            });

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else {
            this.onLoadErrorAlertDialog(data, 'NonPayroll')
        }
    }

    loadPayslipDetailfromAPI = async () => {

        let host = SharedPreference.PAYSLIP_DETAIL_API + SharedPreference.notipayslipID.toString()

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)

        return fetch(host, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: FUNCTION_TOKEN,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {

                this.setState({

                    isscreenloading: false,
                    dataSource: responseJson

                    // datadetail: PayslipDataDetail.detail[dataSource.years[year].detail[index].payroll_id]

                }, function () {
  
                    if (this.state.dataSource.status === 200) {
                      
                        this.props.navigation.navigate('PayslipDetail', {
                            // DataResponse:dataSource,
                            yearlist: 0,
                            initialyear: 0,
                            initialmonth: 0,
                            monthselected: 0,
                            yearselected: 0,
                            Datadetail: this.state.dataSource,
                            rollid: SharedPreference.notipayslipID

                        });

                    } else {

                        Alert.alert(
                            this.state.dataSource.errors[0].code,
                            this.state.dataSource.errors[0].detail,
                            //SharedPreference.notipayslipID.toString(),
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        //console.log('OK Pressed') },
                                    }
                                }
                            ],
                            { cancelable: false }
                        )

                    }



                });

            })
            .catch((error) => {
                console.error(error);
            });
    }

    loadPayslipfromAPI = async () => {

        this.APIPayslipCallback(await RestAPI(SharedPreference.PAYSLIP_LIST_API, SharedPreference.FUNCTIONID_PAYSLIP), 'PayslipList')
    }

    APIPayslipCallback(data, rount) {
        code = data[0]
        data = data[1]
        this.setState({
            isscreenloading: false,
        })
        console.log('datadetail => ', data)
        if (code.SUCCESS == data.code) {
            // SharedPreference.notiPayslipBadge = [];
            // clearTimeout(this.timersession)
            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
                indexselectyear: 2
            });
            
            this.setState({
                notiPayslipBadge: 0,
            })


        } else if (code.NODATA == data.code) {
    
            this.props.navigation.navigate(rount, {
                //  DataResponse: data.data,
                indexselectyear:2
            });

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {
            this.onLoadErrorAlertDialog(data, rount)
        }

    }

    loadClockInOutDetailfromAPI = async () => {

        let today = new Date();
        let url = SharedPreference.CLOCK_IN_OUT_API + SharedPreference.profileObject.employee_id + '&month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        if (parseInt(today.getMonth() + 1) > 9) {
            url = SharedPreference.CLOCK_IN_OUT_API + SharedPreference.profileObject.employee_id + '&month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        }
        this.APIClockInOutCallback(await RestAPI(url, SharedPreference.FUNCTIONID_CLOCK_IN_OUT), 'ClockInOutSelfView')
    }

    loadOTSummarySelffromAPI = async () => {

        let today = new Date();
        let url = SharedPreference.OTSUMMARY_DETAIL + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        if (parseInt(today.getMonth() + 1) > 9) {
            url = SharedPreference.OTSUMMARY_DETAIL + 'month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        }
        let data = await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY)
        code = data[0]
        data = data[1]
        this.setState({
            isscreenloading: false,
        })
        if (code.SUCCESS == data.code) {
            
            this.props.navigation.navigate('OTSummarySelfView', {
                DataResponse: data.data,
            });

        } else if (code.NODATA == data.code) {
         
            this.props.navigation.navigate('OTSummarySelfView', {
                // DataResponse: data.data,
            });

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, 'OTSummary')
        }

    }

    loadHandbooklistfromAPI = async () => {

        this.APIHandbookCallback(await RestAPI(SharedPreference.HANDBOOK_LIST, SharedPreference.FUNCTIONID_HANDBOOK), 'Handbooklist')

    }

    loadOTLineChartfromAPI = async () => {

        let today = new Date();
        let url = SharedPreference.OTSUMMARY_LINE_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        if (parseInt(today.getMonth() + 1) > 9) {
            url = SharedPreference.OTSUMMARY_LINE_CHART + 'month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

        }
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY), 'OTLineChartView', 0)
    }

    loadOTBarChartfromAPI = async () => {

        let today = new Date();
        let url = SharedPreference.OTSUMMARY_BAR_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        if (parseInt(today.getMonth() + 1) > 9) {
            url = SharedPreference.OTSUMMARY_BAR_CHART + 'month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        }
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY), 'OTBarChartView', 0)

    }

    loadOrgStructerfromAPI = async () => {

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrgStructure', 1)
    }

    loadOrgStructerClockInOutfromAPI = async () => {

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrgStructure', 2)
    }

    loadOrgStructerOTAveragefromAPI = async () => {

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrganizationOTStruct', 1)
    }

    loadOrgStructerOTHistoryfromAPI = async () => {

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrganizationOTStruct', 2)
    }

    APICallback(data, rount, option) {

        code = data[0]
        data = data[1]
        this.setState({
            isscreenloading: false,
        })
        if (code.SUCCESS == data.code) {
           
            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
                Option: option
            });
        } else if (code.NODATA == data.code) {

            Alert.alert(

                data.data.code,
                data.data.detail,
    
                [{
                    text: 'OK', onPress: () => {
                        //console.log('OK Pressed')
                    }
                }],
                { cancelable: false }
            )

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }

    }

    APIHandbookCallback(data, rount) {

        code = data[0]
        data = data[1]
        this.setState({
            isscreenloading: false,
        })

        if (code.SUCCESS == data.code) {
           
            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
            });

        } else if (code.NODATA == data.code) {
          
            this.props.navigation.navigate(rount, {
                // DataResponse: data,
            });

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }
    }


    APIClockInOutCallback(data, rount) {

        code = data[0]
        data = data[1]
        this.setState({
            isscreenloading: false,
        })

        if (code.SUCCESS == data.code) {
            
            this.props.navigation.navigate(rount, {
                DataResponse: data,
            });

        } else if (code.NODATA == data.code) {
      
            this.props.navigation.navigate(rount, {
                // DataResponse: data,
            });

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }
    }

    // Alert Error

    onAutenticateErrorAlertDialog() {

        if (SharedPreference.userRegisted) {

            SharedPreference.Sessiontimeout = 0
            clearTimeout(this.timersession)
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
                        this.signout()
                    }
                }],
                { cancelable: false }
            )
        }
    }

    onRegisterErrorAlertDialog() {

        if (!SharedPreference.sessionTimeoutBool) {

            SharedPreference.userRegisted = false;
            timerstatus = false;
            this.setState({
                isscreenloading: false,
            })

            Alert.alert(
                StringText.ALERT_SESSION_AUTHORIZED_TITILE,
                StringText.ALERT_SESSION_AUTHORIZED_DESC,
                [{
                    text: 'OK', onPress: () => {
                        this.signout()
                    }
                }],
                { cancelable: false }
            )
        }
    }

    onNodataExistErrorAlertDialog() {

        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            'NODATA Exist',
            'NODATA Exits',
            [{
                text: 'OK', onPress: () => {

                }
            }],
            { cancelable: false }
        )

    }

    onLoadErrorAlertDialog(error, resource) {

        this.setState({
            isscreenloading: false,
        })

        Alert.alert(

            error.data[0].code,
            error.data[0].detail,

            [{
                text: 'OK', onPress: () => {
                    //console.log('OK Pressed')
                }
            }],
            { cancelable: false }
        )
    }


    loadLeaveQuotafromAPI = async () => {

        let data = await RestAPI(SharedPreference.LEAVE_QUOTA_API, SharedPreference.FUNCTIONID_LEAVE_QUOTA)
        code = data[0]
        data = data[1]

        this.setState({
            isscreenloading: false,
        })
        if (code.SUCCESS == data.code) {

            this.props.navigation.navigate('LeavequotaList', {
                dataResponse: data,
            });

        } else if (code.NODATA == data.code) {
           
            this.props.navigation.navigate('LeavequotaList', {
                dataResponse: data,
            });

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data, 'LeaveQuota')
        }
    }

    loadCalendarfromAPI = async (location) => {

        let year = new Date().getFullYear()
        let company = SharedPreference.profileObject.location
        
        if (company == null || company == undefined) {
            company = "TA"
        }

        let data = await RestAPI(SharedPreference.CALENDER_YEAR_API + year + '&company=' + company, SharedPreference.FUNCTIONID_WORKING_CALENDAR)

        code = data[0]
        data = data[1]
  
        this.setState({
            isscreenloading: false,
        })
        if (code.ERROR == data.code) {
            this.onLoadErrorAlertDialog(data, "calendar")
        } else {
            let locationdef = '';
            for (let i = 0; i < SharedPreference.COMPANY_LOCATION.length; i++) {

                if (SharedPreference.COMPANY_LOCATION[i].key === SharedPreference.profileObject.location) {
         
                    locationdef = SharedPreference.COMPANY_LOCATION[i].value;
                }

            }
          
            this.props.navigation.navigate('calendarYearView', {
                dataResponse: data,
                selectYear: new Date().getFullYear().toString(),
                location: company,
                showLocation:locationdef,
                selectLocation:locationdef,
                codelocation:SharedPreference.profileObject.location,
                page: 1
            });
        }

    }

    //*****************************************************************************
    //*********************** Check API before change screen  **********************
    //*****************************************************************************


    onOpenOrgaStructer() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                // this.setState(this.renderloadingscreen())
                this.loadOrgStructerfromAPI()
            });

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }

    }

    onOpenOrgaStructerClockInOut() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadOrgStructerClockInOutfromAPI()
            });
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }
    }

    onOpenOrgaStructerOTHistory() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadOrgStructerOTHistoryfromAPI()
            });
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }

    }

    onOpenOrgaStructerOTAverage() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadOrgStructerOTAveragefromAPI()
            });

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )


        }


    }


    onOpenOrgaStructerOTHistory() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                // this.setState(this.renderloadingscreen())
                this.loadOrgStructerOTHistoryfromAPI()
            });

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }
    }

    onOpenAnnouncement() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {

            this.loadAnnouncementfromAPI()

        });
    }

    onOpenAnnouncementDetail(item, index) {

        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {

            this.loadAnnouncementDetailfromAPI(item, index)
        });
    }

    onOpenEmployeeInfo() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.loadEmployeeInfoformAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenNonpayroll() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.loadNonpayrollfromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenPayslip() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.loadPayslipfromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenLeaveQuota() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
      
                this.loadLeaveQuotafromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenClockInOut() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadClockInOutDetailfromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenOTSummarySelf() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadOTSummarySelffromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenCalendar() {

        if (SharedPreference.isConnected) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadCalendarfromAPI()
            });

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenHandbook() {

        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadHandbooklistfromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenInsurance() {
        console.log('onOpenInsurance')
        this.props.navigation.navigate('InsuranceListScreen', {

        });

    }

    
    //*********** push notification */


    onOpenPayslipDetail() {
        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                // this.setState(this.renderloadingscreen())
                this.loadPayslipDetailfromAPI()
            });
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onOpenAnnouncementDetailnoti() {
        //console.log("onOpenAnnouncementDetailnoti")
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementDetailfromAPINoti()
        });
    }

    //************** orgstructure 

    onOpenOrgStruct() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerfromAPI()
        });
    }

    /******************************************************************** */
    /*************************  selected tab view  ********************** */
    /******************************************************************** */

    redertabview() {
        if (page === 0) {
            return (
                <View style={{ flex: 1 }}>
                    {this.renderhomeview()}
                </View>
            )
        } else if (page === 1) {
            return (
                <View style={{ flex: 1 }}>
                    {this.renderannouncementview()}
                </View>
            )
        } else if (page === 2) {
            return (
                <View style={{ flex: 1 }}>
                    {this.rendermanagerview()}
                </View>

            )
        } else if (page === 3) {
            return (
                <View style={{ flex: 1 }}>
                    {this.rendersettingview()}
                </View>
            )
        }
    }

    settabscreen(tabnumber) {

        if (tabnumber === 1) {

            if (SharedPreference.isConnected) {
                page = tabnumber
                this.setState({

                    isscreenloading: true,
                    loadingtype: 3
                }, function () {
                    this.loadAnnouncementfromAPI()
                });
            } else {

                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                    [{ text: 'OK', onPress: () => { } }], { cancelable: false }
                )
                return
            }

        }

        if (tabnumber === 2) {

            if (SharedPreference.isConnected) {
                page = tabnumber
                this.setState({

                })
            } else {
                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                    [{ text: 'OK', onPress: () => { } }], { cancelable: false }
                )
                return
            }

        }

        if (tabnumber === 3) {
            if (settingstatus == 'N') {
                return
            }
            page = tabnumber
            this.setState({

            })
        } else {
            page = tabnumber
            this.setState({

            })
        }
    }
    //*******************************************************************************
    //**********************     Announcement activity     **************************
    //*******************************************************************************   

    expand_collapse_Function = () => {

        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandheight) {
            expandheight = 0;
            filterImageButton = require('./../resource/images/filter.png');
        }
        else {
            expandheight = 53;
            filterImageButton = require('./../resource/images/close.png');
        }
        this.setState({});
    }

    select_announce_sort = () => {

        if (SharedPreference.isConnected) {

            if (ascendingSort == false) {

                ascendingSort = true;
                sortImageButton = require('./../resource/images/ascending.png');

            } else {

                ascendingSort = false;
                sortImageButton = require('./../resource/images/descending.png');

            }

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                announcementData = [];
                this.loadAnnouncementfromAPI();

            });
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


    select_init_announce_type = () => {

        if (SharedPreference.isConnected) {

            this.setState({
                loadingtype: 0,
                isscreenloading: true,
                announcementType: this.state.tempannouncementType
            }, function () {
                // this.setState(this.select_search_announce())
                //  this.select_search_announce()
            });
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

    select_announce_type = () => {

        this.setState({
            loadingtype: 3,
            // isscreenloading: false,
            announcementType: this.state.tempannouncementType
        }, function () {
            // this.setState(this.select_search_announce())
            this.select_search_announce()
        });
    }

    cancel_select_announce_type = () => {

        this.setState({

            isscreenloading: false,
            loadingtype: 3,
            announcementType: this.state.initannouncementType,
            tempannouncementType: this.state.initannouncementType

        }, function () {

        });

    }

    select_init_announce_status = () => {

        if (SharedPreference.isConnected) {

            this.setState({
                loadingtype: 1,
                isscreenloading: true,

            }, function () {
                // this.setState(this.select_search_announce())
                //  this.select_search_announce()
            });
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

    cancel_select_announce_status = () => {

        this.setState({
            isscreenloading: false,
            loadingtype: 3,
            announcementStatus: this.state.initannouncementStatus,
            tempannouncementStatus: this.state.initannouncementStatus
            // isscreenloading: false,
            // loadingtype: 2
        }, function () {
            //this.setState(this.select_search_announce())
            //  this.select_search_announce()
        });
    }

    select_announce_status = () => {
        // announcementStatus

        this.setState({

            loadingtype: 3,
            //loadingtype: 0,
            announcementStatus: this.state.tempannouncementStatus

        }, function () {
            //this.setState(this.select_search_announce())
            this.select_search_announce()
        });

    }

    on_select_Announcement_type(item, index) {
        // select_announce_company_type = () => {
        this.setState({
            select_announcement_type: index,
            announcementType: item,
            announcementTypetext: item,
            tempannouncementType: item
        }, function () {
            // this.setState(this.select_announce_type())
            this.select_announce_type()
        });
    }

    on_select_Announcement_status(item, index) {

        console.log('on_select_Announcement_status :', item);

        let temp = item;
        if (item == 'Read') {
            temp = true
        } else if (item == 'Unread') {
            temp = false
        }

        // select_announce_company_type = () => {
        this.setState({
            select_announcement_status: index,
            announcementStatus: temp,
            announcementStatustext: item,
            tempannouncementStatus: temp

        }, function () {
            //this.setState(this.select_announce_status())
            this.select_announce_status()
        });
    }

    select_search_announce = () => {

        if (this.state.isscreenloading === false) {

            this.setState({

                isscreenloading: true,

            }, function () {

                // this.setState(this.renderloadingscreen())
            });

        } else {

            tempannouncementData = []

            announcementData.map((item, i) => {

                if (this.state.announcementStatus === 'All') {

                    if (this.state.announcementType === 'All') {

                        tempannouncementData.push(item)

                    } else {

                        if (item.category === this.state.announcementType) {
                            //////console.log(item)
                            tempannouncementData.push(item)

                        }

                    }

                } else {

                    if (item.attributes.read === this.state.announcementStatus) {

                        if (this.state.announcementType === 'All') {

                            tempannouncementData.push(item)

                        } else {

                            if (item.category === this.state.announcementType) {

                                tempannouncementData.push(item)
                            }

                        }
                    }

                }

            });

            this.setState({

                isscreenloading: false

            }, function () {

                this.setState(this.renderloadingscreen())

            });
        }

    }

    

    onChangeFunction = async (newState) => {

        SharedPreference.autoSyncCalendarBool = newState;

        this.setState({
            // syncCalendar: newState.syncCalendar,
            isscreenloading: true
        });
        // SharedPreference.calendarAutoSync = newState.syncCalendar
        let autoSyncCalendarBool = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
        
        if (autoSyncCalendarBool != null) {
            this.saveAutoSyncCalendar.setAutoSyncCalendar(newState)
        }

        if (newState == false) {

            Alert.alert(
                'Unsync Calendar',
                'Do you want to Unsync Calendar to your device?',
                [
                    {
                        text: 'Cancel', onPress: () => {
                            this.setState({
                                isscreenloading: false
                            }, function () {
                                SharedPreference.autoSyncCalendarBool = true
                            })
                        }
                    },
                    { text: 'OK', onPress: () => { this.ondeleteEventcalendar() } },
                ],
                { cancelable: false }
            )
            

        }else{

            if(SharedPreference.calendarSyncStatus){



            }else{

                this.setState({
                    isscreenloading: false
                }, function () {
                    SharedPreference.autoSyncCalendarBool = false
                })

                // Alert.alert(
                //     'Calendar Permission',
                //     'Please enable permission calendar',
                //     [
                //         {
                //             text: 'OK', onPress: () => {
                //                 this.setState({
                //                     isscreenloading: false
                //                 }, function () {
                //                     SharedPreference.autoSyncCalendarBool = false
                //                 })
                //             }
                //         }
                //     ],
                //     { cancelable: false }
                // )


            }
            this.setState({
                isscreenloading: false
            })

        }


    }

    ondeleteEventcalendar = async () => {

        await this.deleteEventOnCalendar()//TODO bell

        this.setState({
            isscreenloading: true,
            loadingtype: 2
        }, function () {
            this.onsyncAlert();
        })
        // Alert.alert(
        //     'Success',
        //     'Unsync calendar',
        //     [
        //         { text: 'OK', onPress: () => {  this.setState({
        //             isscreenloading: false
        //         })} },
        //     ],
        //     { cancelable: false }
        // )

    }
    
    deleteEventOnCalendar = async () => {

        let currentyear = new Date().getFullYear();
        
        if (Platform.OS === 'android') {

            await this.eventCalendar._deleteEventFromCalendar(currentyear)

        } else {

            await this.eventCalendar._recursiveDeleteAllEvent(currentyear)
        }

        this.setState({
            isscreenloading: false
        })


    }

    onsyncAlert = () => {
        this.setState({}, () => {
            setTimeout(() => {
                this.setState({ loadingtype: 3,isscreenloading: false, }, () => {
                });
            }, 100);
        });
    }

    /*************************************************************** */
    /*************************   render class ********************** */
    /*************************************************************** */

    renderhomeview() {
        //notiPayslipBadge

        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{
                    height: 0,
                    backgroundColor: Colors.calendarRedText
                }} />
                <View style={styles.mainscreen}>
                    <Image
                        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
                        source={require('./../resource/images/mainscreen.png')}
                    />
                    <View style={{ position: 'absolute', height: 100, width: '80%', marginTop: '7%', marginLeft: '6%' }}>

                        <View style={{ flex: 3, justifyContent: 'center', flexDirection: 'column' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 1.5 }}>
                                <Text style={[styles.userTitleText, { fontFamily: "Prompt-Bold" }]} allowFontScaling={SharedPreference.allowfontscale}>Welcome</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.usernameText} allowFontScaling={SharedPreference.allowfontscale}>{this.state.username}</Text>
                            </View>
                            <View style={{ flex: 1 }} />
                            {/* Device Info */}
                            <View style={{ flex: 2, flexDirection: 'column' }} >
                                <View style={{ flex: 2, flexDirection: 'row' }} >
                                    <Text style={{}} allowFontScaling={SharedPreference.allowfontscale}>
                                        {"Version : " + SharedPreference.deviceInfo.appVersion}
                                    </Text>
                                    <Text style={{ color: SharedPreference.SERVER === 'DEV' ? 'black' : 'transparent' }} allowFontScaling={SharedPreference.allowfontscale}>
                                        ( {SharedPreference.SERVER} : {SharedPreference.VERSION} )
                                    </Text>
                                </View>
                                {this.rendertimeInterval()}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, backgroundColor: 'white' }} >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                            ref='MHF01411EmpInfo'
                            disabled={!rolemanagementEmpoyee[0]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenEmployeeInfo.bind(this)}>
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[0] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuEmployee.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>

                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Employee</Text>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Information</Text>

                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref='MHF01411Nonpayroll'
                            disabled={!rolemanagementEmpoyee[1]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenNonpayroll.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[1] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuNonpayroll.png')}
                                    //resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Non Payroll</Text>
                                </View>
                                <View style={this.state.nonPayslipBadge ? this.state.nonPayslipBadge == 1 ? styles.badgeIconpayslip1 : styles.badgeIconpayslip : styles.badgeIconpayslipDisable}>
                                <Text style={this.state.nonPayslipBadge ? { color: 'white',marginLeft:5,marginRight:5 } : { color: 'transparent',marginLeft:5,marginRight:5 }}allowFontScaling={SharedPreference.allowfontscale}>{this.state.nonPayslipBadge}
                                </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            ref='MHF01411Payslip'
                            disabled={!rolemanagementEmpoyee[2]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenPayslip.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[2] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuPayslip.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Pay Slip</Text>
                                </View>
                                {/* notiPayslipBadge */}
                                <View style={ this.state.notiPayslipBadge ? this.state.notiPayslipBadge == 1 ? styles.badgeIconpayslip1 : styles.badgeIconpayslip : styles.badgeIconpayslipDisable}>
                                <Text style={ this.state.notiPayslipBadge ? { color: 'white',marginLeft:5,marginRight:5 } : { color: 'transparent',marginLeft:5,marginRight:5 }}allowFontScaling={SharedPreference.allowfontscale}>{ this.state.notiPayslipBadge}
                                </Text>
                                </View>

                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref='MHF01411LeaveQuota'
                            disabled={!rolemanagementEmpoyee[3]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenLeaveQuota.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[3] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuLeave.png')}
                                    //resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Leave Quota</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref='MHF01411ClockInOut'
                            disabled={!rolemanagementEmpoyee[4]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenClockInOut.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[4] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuClock.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Clock In/Out</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref='MHF01411OTSummary'
                            disabled={!rolemanagementEmpoyee[5]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenOTSummarySelf.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[5] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuOT.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>OT Summary</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref='MHF01411WorkingCalendar'
                            disabled={!rolemanagementEmpoyee[6]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenCalendar.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[6] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuCalendar.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Calendar</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref='MHF01411Handbook'
                            disabled={!rolemanagementEmpoyee[7]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenHandbook.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[7] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuHandbook.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Employee</Text>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Handbooks</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        
                       

                        <TouchableOpacity
                            ref='MHF01B11Insurance'
                            disabled={!rolemanagementEmpoyee[8]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenInsurance.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[8] === 1 ?
                                            { width: 50, height: 50, tintColor: Colors.redTextColor } :
                                            { width: 50, height: 50, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/insurance.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Welfare</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* <View style={{ flex: 1 }} >
                            <View style={styles.mainmenuImageButton}>

                            </View>
                            <View style={styles.mainmenuTextButton}>

                            </View>
                        </View> */}
                    </View>
                </View>

                

            </View>
        )


    }

    renderannouncementheader() {
        console.log('announcementType :', this.state.announcementStatus)
        let tempannouncementStatustext = 'All'
        if (this.state.announcementStatus == true) {
            tempannouncementStatustext = 'Read'
        } else if (this.state.announcementStatus == false) {
            tempannouncementStatustext = 'Unread'
        }

        return (
            <View style={{ flexDirection: 'column', }}>

                <View style={{}} />
                <View style={{ height: 50, flexDirection: 'row', backgroundColor: Colors.calendarRedText, }}>
                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                        onPress={this.select_announce_sort.bind(this)}>
                        <Image
                            style={{ height: 30, width: 30, }}
                            source={sortImageButton}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    <View style={{ flex: 3, justifyContent: 'center' }}>
                        <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Announcement</Text>
                    </View>
                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                        onPress={this.expand_collapse_Function}>
                        <Image
                            style={{ height: 30, width: 30, }}
                            source={filterImageButton}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>

                </View>

                <View style={{ height: expandheight, backgroundColor: 'white' }}>
                    <View style={{ height: 50, marginLeft: 10, marginRight: 10, flexDirection: 'row', }}>
                        <View style={{ flex: 2, justifyContent: 'center' }} >
                            <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: "Prompt-Regular" }} allowFontScaling={SharedPreference.allowfontscale}>Type</Text>
                        </View>
                        <View style={{ flex: 7, justifyContent: 'center' }} >
                            <View style={{ height: 25, justifyContent: 'center', backgroundColor: 'lightgray', borderRadius: 3, }} >
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={(this.select_init_announce_type.bind(this))}
                                >
                                    <Text style={{ textAlign: 'left', color: Colors.redTextColor, fontSize: 12, marginLeft: 10, fontFamily: "Prompt-Regular" }} allowFontScaling={SharedPreference.allowfontscale}>{this.state.announcementType}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 2, justifyContent: 'center' }} >
                            <Text style={{ textAlign: 'center', fontSize: 12, fontFamily: "Prompt-Regular" }} allowFontScaling={SharedPreference.allowfontscale}>Status</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }} >
                            <View style={{ height: 25, justifyContent: 'center', backgroundColor: 'lightgray', borderRadius: 3, }} >
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={(this.select_init_announce_status.bind(this))}
                                >
                                    <Text style={{ textAlign: 'left', color: Colors.redTextColor, fontSize: 12, marginLeft: 10, fontFamily: "Prompt-Regular" }} allowFontScaling={SharedPreference.allowfontscale}>{tempannouncementStatustext}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderannouncementbody() {

        return (
            <View style={{ flex: 1 }}>

                <ScrollView
                    ref="announcescrollView"
                    style={{ backgroundColor: 'lightgray' }}

                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}

                        />
                    }
                    onScroll={(event) => {
                      
                        var windowHeight = Dimensions.get('window').height,
                            height = event.nativeEvent.contentSize.height,
                            offset = event.nativeEvent.contentOffset.y;
                      
                        if ((height - (windowHeight - 120 - expandheight) < offset) & (this.state.enddragannounce)) {
                        
                            if (this.state.loadmore === false) {
                                this._onLoadMore()
                            }

                        }

                    }}

                    onScrollBeginDrag={(event) => {
                        this.setState({
                            enddragannounce: true
                        })
                    }}

                    onScrollEndDrag={(event) => {
                        this.setState({
                            enddragannounce: false
                        })

                    }}
                >
                    {
                        tempannouncementData.map((item, index) => (

                            <View key={200 + index} style={item.attributes.read === false ? styles.announcementitemUnread : styles.announcementitemRead}>

                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ flex: 1 }}

                                        onPress={() => { this.onOpenAnnouncementDetail(item, index) }}>

                                        <View style={{ flex: 1, flexDirection: 'row',justifyContent:'center' }}>
                                            <View style={{ flex: 1.8, justifyContent: 'center' }}>
                                                <Image
                                                    style={{ height: 40, width: 40 }}
                                                    source={item.category === 'Emergency Announcement' || item.category === 'Event Announcement' ?
                                                        item.category === 'Event Announcement' ? require('./../resource/images/Event.png') : require('./../resource/images/Emergency.png') :
                                                        item.category === 'Company Announcement' ? require('./../resource/images/Company.png') : require('./../resource/images/General.png')}
                                                />
                                            </View>
                                            <View style={{ flex: 5.5, justifyContent: 'center' }}>
                                                <View style={{ height: 30 * scale, justifyContent: 'flex-end' }}>
                                                    <Text style={styles.announcementtext1} allowFontScaling={SharedPreference.allowfontscale}>
                                                        {annountype[item.category]}
                                                    </Text>
                                                </View>
                                                <View style={{ height: 30 * scale, justifyContent: 'flex-start' }}>
                                                    <Text style={styles.announcementtext2} numberOfLines={1} ellipsizeMode={'tail'} allowFontScaling={SharedPreference.allowfontscale}>
                                                        {item.title}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 3, justifyContent: 'center' }}>
                                                <View style={{ height: 30 * scale,  justifyContent: 'flex-end' ,marginTop:-4 * scale}}>
                                                    <Text style={item.attributes.read === false ? styles.announcementtext3 : styles.announcementtext4} allowFontScaling={SharedPreference.allowfontscale}>
                                                        {item.attributes.last_modified}
                                                    </Text>
                                                </View>
                                                <View style={{ height: 30 * scale,  justifyContent: 'flex-end' }}>
                                                    {/* <Text style={styles.announcementtext2} numberOfLines={1} ellipsizeMode={'tail'} allowFontScaling={SharedPreference.allowfontscale}>
                                                        
                                                    </Text> */}
                                                </View>
                                            </View>


                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
                <View style={tempannouncementData.length | !this.state.loadingannouncement ? { height: 0 } : { width: '100%', height: '100%', position: 'absolute', justifyContent: 'center' }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={tempannouncementData.length | !this.state.loadingannouncement ? styles.announcementtexthidenodata : styles.announcementtextshownodata}allowFontScaling={SharedPreference.allowfontscale}> No Data</Text>
                    </View>
                </View>
            </View>
        );
    }

    renderannouncementview() {

        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>

                {this.renderannouncementheader()}
                {this.renderannouncementbody()}
            </View>
        )

    }

    rendermanagerview() {

        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{backgroundColor: Colors.calendarRedText}} />
                <View style={{ height: 50, flexDirection: 'row', backgroundColor: '#F20909', }}>

                    <View style={{ flex: 5, justifyContent: 'center' }}>

                        <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Manager View</Text>

                    </View>

                </View>
                <View style={{ flex: 1, backgroundColor: 'white' }} >
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref=''
                            style={{ flex: 1 }}
                            // rolemanagementManager
                            disabled={!rolemanagementManager[0]}
                            onPress={this.onOpenOrgaStructer.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={rolemanagementManager[0] === 1 ?
                                            { flex: 0.5, tintColor: Colors.redTextColor } :
                                            { flex: 0.5, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuEmployee.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>

                                    <Text style={styles.managermenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Employee</Text>
                                    <Text style={styles.managermenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Information</Text>

                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref=''
                            disabled={!rolemanagementManager[1]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerClockInOut.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={rolemanagementManager[1] === 1 ?
                                            { flex: 0.5, tintColor: Colors.redTextColor } :
                                            { flex: 0.5, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuClock.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>
                                    <Text style={styles.managermenuTextname} allowFontScaling={SharedPreference.allowfontscale}>Clock In/Out</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref=''
                            disabled={!rolemanagementManager[2]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerOTAverage.bind(this)}

                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={rolemanagementManager[2] === 1 ?
                                            { flex: 0.5, tintColor: Colors.redTextColor } :
                                            { flex: 0.5, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuAverage.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>
                                    <Text style={styles.managermenuTextname} allowFontScaling={SharedPreference.allowfontscale}>Overtime Average</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref=''
                            disabled={!rolemanagementManager[3]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerOTHistory.bind(this)}>
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={rolemanagementManager[3] === 1 ?
                                            { flex: 0.5, tintColor: Colors.redTextColor } :
                                            { flex: 0.5, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuHistory.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>
                                
                                    <Text style={styles.managermenuTextname}allowFontScaling={SharedPreference.allowfontscale}>Overtime</Text>
                                    <Text style={styles.managermenuTextname}allowFontScaling={SharedPreference.allowfontscale}>History Information</Text>

                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>

                </View>
            </View>
        )
    }

    rendersettingview() {

        if (SharedPreference.APPLICATION_DEVICE === 'STM') {
            return (
           <View style={{ flex: 1, flexDirection: 'column',backgroundColor:'white' }}>
               <View style={{backgroundColor: Colors.calendarRedText}} />
               <View style={{ height: 50, flexDirection: 'row', backgroundColor: '#F20909', }}>

                   <View style={{ flex: 5, justifyContent: 'center' }}>

                       <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Setting</Text>

                   </View>

               </View>
               <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <TouchableOpacity
                       onPress={(this.onChangePIN.bind(this))}>
                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Change PIN</Text>
                   </TouchableOpacity>
               </View>    
               <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <View style={{ flex: 2, justifyContent: 'center' }}>

                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Application Name</Text>
                   </View>
                   <View style={{ flex: 1.5, justifyContent: 'center' }}>
                       <Text style={styles.settingrighttext}allowFontScaling={SharedPreference.allowfontscale}>STM Connect</Text>

                   </View>
               </View>

               <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <View style={{ flex: 2, justifyContent: 'center' }}>

                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Application Version</Text>
                   </View>
                   <View style={{ flex: 1.5, justifyContent: 'center' }}>
                       <Text style={styles.settingrighttext}allowFontScaling={SharedPreference.allowfontscale}>{SharedPreference.deviceInfo.appVersion}</Text>

                   </View>
               </View>

               <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <TouchableOpacity
                       onPress={(this.select_sign_out.bind(this))}>
                       <Text style={styles.settingleftredtext}allowFontScaling={SharedPreference.allowfontscale}>Sign Out</Text>
                   </TouchableOpacity>
               </View>
               <View style={{ flex: 8 }}>


               </View>
           </View>
       )
        }else{
            return (
           <View style={{ flex: 1, flexDirection: 'column',backgroundColor:'white' }}>
               <View style={{backgroundColor: Colors.calendarRedText}} />
               <View style={{ height: 50, flexDirection: 'row', backgroundColor: '#F20909', }}>

                   <View style={{ flex: 5, justifyContent: 'center' }}>

                       <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Setting</Text>

                   </View>

               </View>
               <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <TouchableOpacity
                       onPress={(this.onChangePIN.bind(this))}>
                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Change PIN</Text>
                   </TouchableOpacity>
               </View>
             
               <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <View style={{ flex: 4, justifyContent: 'center' }}>
                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Sync Calendar</Text>

                   </View>
                   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                       <Switch
                           onValueChange={(value) => this.onChangeFunction( value)}
                           value={SharedPreference.autoSyncCalendarBool}
                       />
                   </View>
               </View>
               
               <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <View style={{ flex: 2, justifyContent: 'center' }}>

                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Application Name</Text>
                   </View>
                   <View style={{ flex: 1.5, justifyContent: 'center' }}>
                       <Text style={styles.settingrighttext}allowFontScaling={SharedPreference.allowfontscale}>STM Connect</Text>

                   </View>
               </View>

               <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <View style={{ flex: 2, justifyContent: 'center' }}>

                       <Text style={styles.settinglefttext}allowFontScaling={SharedPreference.allowfontscale}>Application Version</Text>
                   </View>
                   <View style={{ flex: 1.5, justifyContent: 'center' }}>
                       <Text style={styles.settingrighttext}allowFontScaling={SharedPreference.allowfontscale}>{SharedPreference.deviceInfo.appVersion}</Text>

                   </View>
               </View>

               <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                   <TouchableOpacity
                       onPress={(this.select_sign_out.bind(this))}>
                       <Text style={styles.settingleftredtext}allowFontScaling={SharedPreference.allowfontscale}>Sign Out</Text>
                   </TouchableOpacity>
               </View>
               <View style={{ flex: 8 }}>


               </View>
           </View>
       )
        }
   }

    signout() {

        clearTimeout(this.timer);
        clearTimeout(this.timersession);
        SharedPreference.userRegisted = false
        this.state.loadingannouncement = false
        timerstatus = false
        SharedPreference.Handbook = []
        SharedPreference.profileObject = null
        SharedPreference.notiAnnounceMentBadge = 0
        page = 0
        
        
        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER

        this.saveProfile.setProfile(null)
        if (Platform.OS === 'android') {
            BadgeAndroid.setBadge(0)
        } else if (Platform.OS === 'ios') {
            const localNotification = new firebase.notifications.Notification()

                .ios.setBadge(0);
            firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
        }

        this.setState({
            isscreenloading: false,
            notiAnnounceMentBadge:0
        },function(){
            this.props.navigation.navigate('RegisterScreen')
        })
        

    }

    select_sign_out() {

        if (SharedPreference.isConnected) {

            Alert.alert(
                'Sign Out',
                'Do you want to sign out?',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'OK', onPress: () => { this.on_confirm_signout() } },
                ],
                { cancelable: false }
            )
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )

        }


    }

    on_confirm_signout() {

        clearTimeout(this.timer);

        this.setState({
            isscreenloading: true
        }, function () {
            this.loadSignOutAPI()
        })
        //TODO Bell
    }


    notificationListener(badge) {

        if (Platform.OS === 'android') {
            BadgeAndroid.setBadge(badge)
            // const localNotification = new firebase.notifications.Notification({
            //     sound: 'default',
            //     show_in_foreground: true,
            //   })
            //   .setNotificationId(notification.notificationId)
            //   .setTitle(notification.title)
            //   .setSubtitle(notification.subtitle)
            //   .setBody(notification.body)
            //   .setData(notification.data)
            //   .android.setChannelId('channelId') // e.g. the id you chose above
            //   .android.setSmallIcon('ic_stat_notification') // create this icon in Android Studio
            //   .android.setColor('#000000') // you can set a color here
            //   .android.setPriority(firebase.notifications.Android.Priority.High);

            // firebase.notifications()
            //   .displayNotification(localNotification)
            //   .catch(err => console.error(err));

        } else if (Platform.OS === 'ios') {
            const localNotification = new firebase.notifications.Notification()
                //   .setNotificationId(notification.notificationId)
                //   .setTitle(notification.title)
                //   .setSubtitle(notification.subtitle)
                //   .setBody(notification.body)
                //   .setData(notification.data)
                .ios.setBadge(badge);
            firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
        }


    }

    loadSignOutAPI = async () => {
        let data = await SignOutAPI("1")
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            this.state.loadingannouncement = false;
            
            timerstatus = false
            SharedPreference.Handbook = []
            announcementData = []
            tempannouncementData = []
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            
            this.saveAutoSyncCalendar.setAutoSyncCalendar(true)
            
            await this.deleteEventOnCalendar()//TODO bell
            clearTimeout(this.timer);
            clearTimeout(this.timersession);
            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
            SharedPreference.company=''
            page = 0
            this.setState({
                isscreenloading: false,
                notiAnnounceMentBadge:0
            },function(){
                if(SharedPreference.APPLICATION_DEVICE === 'STM'){
                    SharedPreference.company = 'stm'
                    }else{
                        SharedPreference.company = 'tmap-em'
                    }
                this.props.navigation.navigate('RegisterScreen')
            })
            

        } else if (code.INVALID_USER_PASS == data.code) {

            page = 0
            timerstatus = false
            SharedPreference.Handbook = []
            announcementData = []
            tempannouncementData = []
            this.props.navigation.navigate('RegisterScreen')
            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER

        } else {

            page = 0
            timerstatus = false
            SharedPreference.Handbook = []
            this.setState({
                isscreenloading: false
            })
            
            this.props.navigation.navigate('RegisterScreen')
            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
  
        }

        if (Platform.OS === 'android') {
            BadgeAndroid.setBadge(0)
        } else if (Platform.OS === 'ios') {
            const localNotification = new firebase.notifications.Notification()

                .ios.setBadge(0);
            firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
        }
    }

    onChangePIN = async () => {

        if (SharedPreference.isConnected) {
            //for chaeck permission
            this.setState({

                isscreenloading: true,

            })
            let data = await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN)
            code = data[0]
            data = data[1]
            if (code.DOES_NOT_EXISTS == data.code) {

                this.onRegisterErrorAlertDialog()

            } else if (code.INVALID_AUTH_TOKEN == data.code) {

                this.onAutenticateErrorAlertDialog()

            } else {
                this.setState({

                    isscreenloading: false,
    
                })
              
                this.props.navigation.navigate('ChangePINScreen')
            }

        } else {
            //TODO Bell
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } }], { cancelable: false }
            )
        }
    }

    onCheckPINWithChangePIN = async (PIN1, PIN2) => {

        // let data = await LoginChangePinAPI(PIN1, PIN2, SharedPreference.FUNCTIONID_PIN)
        let data = await RestAPI(SharedPreference.HANDBOOK_LIST, SharedPreference.FUNCTIONID_HANDBOOK)

        code = data[0]
        data = data[1]

        if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {
            
            this.props.navigation.navigate('ChangePINScreen')
        }

    }

    cancel_select_Announcement_type() {
        this.setState({

            loadingtype: 3,
            isscreenloading: false,

        })

    }
    cancel_select_change_month_andr() {

        this.setState({

            loadingtype: 3,
            isscreenloading: false,

        })

    }

    renderpickerview() {
        if (this.state.loadingtype == 1) {
            if (Platform.OS === 'android') {
                return (
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={styles.titlepicker} allowFontScaling={SharedPreference.allowfontscale}>Select Status</Text>
                            </View>

                            <ScrollView style={{ height: '40%' }}>
                                {
                                    announstatuspicker.map((item, index) => (
                                        <TouchableOpacity style={styles.button} 
                                             key={index + 200}
                                            onPress={() => { this.on_select_Announcement_status(item.value, index) }}
                                        >
                                            <View style={{ justifyContent: 'center', height: 40, alignItems: 'center', }} key={index + 200}>
                                                {/* <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {item}</Text> */}
                                                <Text style={index === this.state.select_announcement_status ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18, fontFamily: "Prompt-Regular", width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18, fontFamily: "Prompt-Regular", width: '100%', height: 30, alignItems: 'center' }} allowFontScaling={SharedPreference.allowfontscale}> {item.value}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                            </ScrollView>
                            <View style={{ flexDirection: 'row', height: 40, }}>
                                <View style={{ flex: 2 }} />
                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => { this.cancel_select_change_month_andr() }}
                                >
                                    <Text style={styles.buttonpicker}allowFontScaling={SharedPreference.allowfontscale}> Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )

            }

            this.state.initannouncementStatus = this.state.announcementStatus;
            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.titlepicker} allowFontScaling={SharedPreference.allowfontscale}>Select Status</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.tempannouncementStatus}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                tempannouncementStatus: itemValue,
                                // announcementStatustext: announstatus[itemValue],

                            }, function () {
                                // tempannouncementStatustext = announstatus[itemValue];
                                // tempannouncementStatus = itemValue;
                            })}>
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="Read" value={true} />
                            <Picker.Item label="Unread" value={false} />
                        </Picker>
                        <View style={{ flexDirection: 'row', height: 50 }}>
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.cancel_select_announce_status.bind(this))}
                            >
                                <Text style={styles.buttonpickerdownloadleft} allowFontScaling={SharedPreference.allowfontscale}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.select_announce_status.bind(this))}
                            >
                                <Text style={styles.buttonpickerdownloadright} allowFontScaling={SharedPreference.allowfontscale}>OK</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            )

        } else if (this.state.loadingtype == 0) {

            if (Platform.OS === 'android') {

                return (
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={styles.titlepicker}allowFontScaling={SharedPreference.allowfontscale}>Select Type</Text>
                            </View>
                            <ScrollView style={{ height: '40%' }}>
                                {
                                    announcementpicker.map((item, index) => (
                                        <TouchableOpacity style={styles.button}
                                        key={index + 300}
                                            onPress={() => { this.on_select_Announcement_type(item.value, index) }}
                                        >
                                            <View style={{ justifyContent: 'center', height: 40, alignItems: 'center', }} key={index + 200}>
                                                {/* <Text style={styles.titlepicker}> {item}</Text> */}
                                                <Text style={index === this.state.select_announcement_type ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18,fontFamily: "Prompt-Regular", width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18,fontFamily: "Prompt-Regular", width: '100%', height: 30, alignItems: 'center' }}allowFontScaling={SharedPreference.allowfontscale}> {item.value}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                            </ScrollView>
                            <View style={{ flexDirection: 'row', height: 40, }}>
                                <View style={{ flex: 2 }} />
                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => { this.cancel_select_Announcement_type() }}
                                >
                                    <Text style={styles.buttonpicker}allowFontScaling={SharedPreference.allowfontscale}> Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }

            this.state.initannouncementType = this.state.announcementType;

            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.titlepicker}allowFontScaling={SharedPreference.allowfontscale}>Select Type</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.tempannouncementType}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                tempannouncementType: itemValue,
                                //  announcementTypetext: annountype[itemValue],
                            }, function () {

                                //   initannouncementType = itemValue;
                                //   initannouncementTypetext = annountype[itemValue];

                                })}>
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="Company Announcement" value="Company Announcement" />
                            <Picker.Item label="Emergency Announcement" value="Emergency Announcement" />
                            <Picker.Item label="Event Announcement" value="Event Announcement" />
                            <Picker.Item label="General Announcement" value="General Announcement" />
                        </Picker>
                        <View style={{ flexDirection: 'row', height: 50 }}>
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.cancel_select_announce_type.bind(this))}
                            >
                                <Text style={styles.buttonpickerdownloadleft}allowFontScaling={SharedPreference.allowfontscale}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.select_announce_type)}>
                                <Text style={styles.buttonpickerdownloadright}allowFontScaling={SharedPreference.allowfontscale}>OK</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            )

        } else if (this.state.loadingtype == 2) {

            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white',borderRadius:10 }}>
                        <View style={{ height: 100, width: '100%', justifyContent: 'center',alignItems:'center' }}>
                            <Text style={{ fontSize: 15 }}allowFontScaling={SharedPreference.allowfontscale}>Unsync Success</Text>
                        </View>
                    </View>
                </View>
              );

        }else if (this.state.loadingtype == 4) {

            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white',borderRadius:10 }}>
                        <View style={{ height: 100, width: '100%', justifyContent: 'center',alignItems:'center' }}>
                            <Text style={{ fontSize: 15 }}allowFontScaling={SharedPreference.allowfontscale}>Confirm Exit</Text>
                        </View>
                    </View>
                </View>
              );

        }

        return (
            <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                <ActivityIndicator />
            </View>
        )

    }

    renderloadingscreen() {
        if (this.state.isscreenloading) {
            return (
                <View style={{ height: Layout.window.height, width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>
                    </View>
                    {this.renderpickerview()}
                </View>
            )
        }

    }

    pushnodetailscreen() {
        return (
            <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>
                </View>

            </View>
        )
    }

    rendermanagertab() {

        if (managerstatus === 'Y') {

            return (
                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(2) }}>

                    <Image
                        style={page === 2 ?
                            { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                            { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                        }
                        source={require('./../resource/images/manager_icon.png')}
                        resizeMode='contain'
                    />

                </TouchableOpacity>

            );
        }
        return (
            <View style={{ flex: 0, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(2) }}>

            </View>
        );

    }
    
    rendertimeInterval() {
        if (SharedPreference.SERVER === 'DEV') {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'black', fontSize: 10 }}allowFontScaling={SharedPreference.allowfontscale}>{this.state.sendlastupdate}''{this.state.Sessiontimeout}</Text>
                </View>
            )
        }
        return (
            <View style={{ flex: 1 }}>
                <Text style={{ color: 'transparent', fontSize: 10 }}></Text>
            </View>
        )

    }

    render() {
        let badgeBG = 'transparent'
        let badgeText = 'transparent'
        let annstatus = false
        let setstatus = false
        if (announcestatus == 'N') {
            annstatus = true
        }
        if (settingstatus == 'N') {
            setstatus = true
        }
        
        if (this.state.notiAnnounceMentBadge) {
            badgeBG = 'red'
            badgeText = 'white'
        }
        const {
              style,
            children,
            } = this.props;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.calendarRedText }}
                collapsable={true}
                {...this.panResponder.panHandlers}
            >
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{ flex: 1 }} >
                        {this.redertabview()}
                    </View>
                    <View style={{ height: 1, backgroundColor: Colors.lightGrayTextColor }} />
                    <View style={{ height: 50, flexDirection: 'row',backgroundColor:'white'}} >
                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(0) }}>
                            <Image
                                style={page === 0 ?
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                                }
                                source={require('./../resource/images/home_icon.png')}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                            disabled={annstatus}
                            onPress={() => { this.settabscreen(1) }}>
                            <Image
                                style={page === 1 ?
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                                }
                                source={require('./../resource/images/announcement_icon.png')}
                                resizeMode='contain'
                            />
                            <View style={{ position: 'absolute', height: '100%' }}  >
                                <View style={this.state.notiAnnounceMentBadge ? this.state.notiAnnounceMentBadge == 1 ? styles.badgeIconannouncement1 : styles.badgeIconannouncement : styles.badgeIconannouncementdisable}>
                                    <Text style={{ fontSize: 15, color: badgeText, textAlign: 'center', marginLeft: 5, marginRight: 5, height: 20, borderRadius: 10 }}
                                    allowFontScaling={SharedPreference.allowfontscale}>{this.state.notiAnnounceMentBadge}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                        {this.rendermanagertab()}
                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                            disabled={setstatus}
                            onPress={() => { this.settabscreen(3) }}>
                            <Image
                                style={page === 3 ?
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                                }
                                source={require('./../resource/images/setting_icon.png')}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {this.renderloadingscreen()}
            </SafeAreaView>
        );
    }
}

const shadow = {
    shadowColor: 'black',
    shadowOpacity: 0.1,
    elevation: 2,
    shadowOffset: { width: 0, height: 3 }
}

