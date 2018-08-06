import React, { Component } from "react";
import {
    View, Text, TouchableOpacity, Picker,
    Image, Switch, ActivityIndicator, ScrollView,
    Button, RefreshControl, Alert, NetInfo,
    Platform, Dimensions, BackHandler
} from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Layout from "./../SharedObject/Layout"
import Colors from "./../SharedObject/Colors"
import SharedPreference from "./../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"
import SaveAutoSyncCalendar from "../constants/SaveAutoSyncCalendar";
import SaveProfile from "../constants/SaveProfile"
import StringText from '../SharedObject/StringText';
import payslipDetail from "./MHF05012PaySlipDetailView";
import { months } from "moment";
import Month from "../constants/Month"
const ROLL_ANNOUNCE = 10;

//SharedPreference.NOTIFICATION_CATEGORY
let annountype = { 'All': 'All', 'Company Announcement': 'Company Announcement', 'Emergency Announcement': 'Emergency Announcement', 'Event Announcement': 'Event Announcement', 'General Announcement': 'General Announcement' };

//SharedPreference.READ_TYPE
let announstatus = { 'All': 'All', 'true': 'Read', 'false': 'Unread' };

let ICON_SIZE = '60%';
let expandheight = 0;
let announcementData = [];
let tempannouncementData = [];
let ascendingSort = false;
let filterImageButton = require('./../resource/images/filter.png');
let sortImageButton = require('./../resource/images/descending.png');

let initannouncementType = 'All';
let initannouncementTypetext = 'All';
let initannouncementStatus = 'All';
let initannouncementStatustext = 'All'
let page = 0;
let orgcode = '';//60162305;

let managerstatus = 'Y';
let announcestatus = 'Y';
let rolemanagementEmpoyee = [1, 1, 1, 1, 1, 1, 1, 1];
let rolemanagementManager = [0, 0, 0, 0];
let timerstatus;
// SharedPreference.notipayAnnounceMentID = 1
// SharedPreference.notipayslipID = 0

const _format = 'YYYY-MM-DD hh:mm:ss'
import moment from 'moment'

import Authorization from "../SharedObject/Authorization";
//import { NODATA } from "dns";


let tdata = {
    '_data':
    {
        'gcm.notification.type': 'Payroll',
        'google.c.a.e': '1',
        'gcm.notification.id': '160'
    }
}



export default class HMF01011MainView extends Component {

    saveAutoSyncCalendar = new SaveAutoSyncCalendar()
    saveProfile = new SaveProfile()



    constructor(props) {
        super(props);
        this.state = {
            isscreenloading: false,
            syncCalendar: true,
            announcementType: initannouncementType,
            announcementTypetext: initannouncementTypetext,
            announcementStatus: initannouncementStatus,
            announcementStatustext: initannouncementStatustext,
            isConnected: true,
            refreshing: false,
            loadmore: false,
            announcepage: 0,
            enddragannounce: false,
            annrefresh: false,
            username: SharedPreference.profileObject.employee_name,
            //  page: 0
        }

        //Check Manager status
        for (let i = 0; i < SharedPreference.profileObject.role_authoried.length; i++) {
            // if (SharedPreference.profileObject.role_authoried[i].module_function === 'HF0501') {
            //     managerstatus = 'Y'
            // }
            // switch (SharedPreference.profileObject.role_authoried[i].module_function) {
            //     case 'HF0121': {
            //     }
            //     case 'HF0601': {
            //     }
            //     case 'HF0501': {
            //     }
            //     case 'HF0901': {
            //     }
            //     case 'HF0701': {
            //     }
            //     case 'HF0801': {
            //     }
            //     case 'HF0311': {
            //     }
            //     case 'HF0A01': {
            //     }case 'HF0701': {
            //     }
            //     case 'HF0801': {
            //     }
            //     case 'HF0311': {
            //     }
            //     case 'HF0A01': {
            //     }
            // }
        }
        console.log('tdata : ', tdata._data['gcm.notification.type'])
        //console.log("MainView ====> profileObject ==> managerstatus ==> ", managerstatus)
    }

    componentWillMount() {
        if (Platform.OS !== 'android') return
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.navigate('HomeScreen');
            return true
        })
    }

    loadData = async () => {
        let autoSyncCalendarBool = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
        if (autoSyncCalendarBool == null) {
            autoSyncCalendarBool = true
        }
        this.setState({
            syncCalendar: autoSyncCalendarBool
        })

        //console.log("loadData ==> autoSyncCalendarBool 2 ==> : ", autoSyncCalendarBool)
        SharedPreference.calendarAutoSync = autoSyncCalendarBool
    }

    async componentDidMount() {

        // console.log("componentDidMount timerstatus : ", timerstatus)
        if (!timerstatus) {
            // console.log("componentDidMount timerstatus ==> start")
            this.inappTimeInterval();
            timerstatus = true;
        }
        //this.setState({ page: 0, })
        this.redertabview()

        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);

        if (SharedPreference.notipayslipID) {

            this.onOpenPayslipDetail()

        } else if (SharedPreference.notiAnnounceMentID) {
            console.log("if SharedPreference.notiAnnounceMentID")

            this.onOpenAnnouncementDetailnoti()

        }
        await this.loadData()


    }

    onLoadInAppNoti = async () => {

        let today = new Date()
        const newdate = moment(today).format(_format).valueOf();

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)
        latest_date = "2017-01-01 12:00:00"
        return fetch(SharedPreference.PULL_NOTIFICATION_API + latest_date, {
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
                    } else if (responseJson.status == 200) {
                        // console.log("onLoadInAppNoti ==> responseJson ", responseJson)

                        let dataArray = responseJson.data
                        let currentyear = new Date().getFullYear();

                        let monthArray = []
                        for (let index = 0; index < 12; index++) {
                            monthData = {
                                "month": index + 1,
                                "badge": 0
                            }
                            monthArray.push(monthData)
                        }
                        // console.log("monthArray ==> ", monthArray)

                        let dataCustomArray = [
                            {
                                "year": currentyear - 1,
                                "detail": monthArray
                            },
                            {
                                "year": currentyear,
                                "detail": monthArray
                            },
                        ]

                        for (let index = 0; index < dataArray.length; index++) {
                            const dataReceive = dataArray[index];
                            // console.log("element ==> ", dataReceive.function_id)

                            if (dataReceive.function_id == "PHF06010") {//if nonPayroll
                                dataListArray = dataReceive.data_list //TODO Bell

                                // console.log("dataListArray ==> ", dataListArray)
                                for (let index = 0; index < dataListArray.length; index++) {
                                    const str = dataListArray[index];
                                    // console.log("str ==> ", str)
                                    var res = str.split("|");
                                    // console.log("res ==> ", res[1])
                                    var data = res[1]

                                    var monthYear = data.split("-");
                                    // console.log("dataListArray ==> monthYear ==> ", monthYear)

                                    var year = monthYear[0]
                                    var month = monthYear[1]

                                    // console.log("dataListArray ==> year ==>  ", year)
                                    // console.log("dataListArray ==> month ==> ", month)
                                    // console.log("dataCustomArray2 ==> ", dataCustomArray.length)

                                    for (let index = 0; index < dataCustomArray.length; index++) {
                                        const data = dataCustomArray[index];
                                        // console.log("dataCustomArray data ==> ", data)
                                        // console.log("dataCustomArray year ==> ", data.year)

                                        if (year == data.year) {
                                            const detail = data.detail
                                            // console.log("detail ==> ", detail)
                                            // console.log("month select  ==> ", month)

                                            let element = detail.find((p) => {
                                                return p.month === JSON.parse(month)
                                            });
                                            // console.log("element ==> ", element)

                                            element.badge = element.badge + 1
                                            // console.log("detail badge ==> ", element.badge)

                                        }



                                    }

                                }
                            }
                        }

                        // console.log("dataCustomArray ==> new ==> ", dataCustomArray)

                    } else {
                        if (timerstatus) {
                            this.inappTimeInterval()
                        }
                    }
                    this.setState({
                    }, function () {
                    });

                } catch (error) {
                    ////console.log('erreo1 :', error);
                }
            })
            .catch((error) => {

                //console.log('error :', error)

            });
    }

    inappTimeInterval() {
        this.timer = setTimeout(() => {
            this.onLoadInAppNoti()
        }, 2000);
        // }, 60000);
    };

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    handleConnectivityChange = isConnected => {
        this.setState({ isConnected });
    };

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
        page = 1
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

        // this.setState({
        //     loadingtype: 3,
        //     isscreenloading: true,
        //     loadmore: true,
        //     page: 1,
        // });
        this.setState({
            isscreenloading: true,
            loadingtype: 3,
            loadmore: true,

        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementMorefromAPI()
        });

    }


    loadAnnouncementfromAPI = async () => {

        let totalroll = announcementData.length;

        if (this.state.annrefresh) {

            totalroll = ROLL_ANNOUNCE;

        } else if (!totalroll) {

            totalroll = ROLL_ANNOUNCE
        }

        // //console.log("calendarPDFAPI ==>  functionID : ", functionID)
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_ANNOUCEMENT, SharedPreference.profileObject.client_token)
        //console.log("calendarPDFAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

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
                    this.setState({
                        isscreenloading: false,
                        dataSource: responseJson,
                        announcepage: 0,
                        annrefresh: false
                    }, function () {
                        if (this.state.dataSource.status === 200) {

                            this.setState(this.renderloadingscreen());
                            console.log('this.state.dataSource.data: ', this.state.dataSource.data)
                            tempannouncementData = []
                            announcementData = this.state.dataSource.data;
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
                        } else {
                            Alert.alert(
                                this.state.dataSource.errors[0].code,
                                this.state.dataSource.errors[0].detail,
                                [
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
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
        //console.log('hostApi :', hostApi)

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_ANNOUCEMENT, SharedPreference.profileObject.client_token)
        //console.log("calendarPDFAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

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

                        //console.log('this.state.dataSource.data :', this.state.dataSource.data)
                        //console.log('this.state.dataSource.status :', this.state.dataSource.status)
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
    loadAnnouncementDetailfromAPINoti = async () => {
        console.log("loadAnnouncementDetailfromAPINoti")
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
       
        this.setState({

            isscreenloading: false,

        })

        if (code.SUCCESS == data.code) {
            console.log('APIAnnouncementDetailCallback ==> code ==> ',code.SUCCESS)
            if (tempannouncementData.length) {
                tempannouncementData[index].attributes.read = true
            }
            console.log('APIAnnouncementDetailCallback ==> data ==> ',data.data)

            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
            });

            SharedPreference.notipayAnnounceMentID = 0;
            // } else if (code.NODATA == data.code) {

            //     Alert.alert(
            //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            //         [{
            //             text: 'OK', onPress: () => {

            //             }
            //         }],
            //         { cancelable: false }
            //     )
            // } else if (code.DOES_NOT_EXISTS == data.code) {

            //     this.onNodataExistErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)

        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }

    }

    loadEmployeeInfoformAPI = async () => {

        //console.log("loadEmployeeInfoformAPI :", SharedPreference.profileObject.employee_id)
        this.APICallback(await RestAPI(SharedPreference.EMP_INFO_CAREERPATH_API + SharedPreference.profileObject.employee_id, SharedPreference.FUNCTIONID_EMPLOYEE_INFORMATION), 'EmployeeInfoDetail')

    }

    loadNonpayrollfromAPI = async () => {

        let data = await RestAPI(SharedPreference.NONPAYROLL_SUMMARY_API, SharedPreference.FUNCTIONID_NON_PAYROLL)
        code = data[0]
        data = data[1]
        //console.log("loadNonpayrollfromAPI  ==> data : ", data.data)

        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate('NonPayrollList', {
                dataResponse: data.data,
            });

        } else if (code.NODATA == data.code) {

            this.props.navigation.navigate('NonPayrollList', {
                //dataResponse: data.data,
            });

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)

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
                    //console.log('status : ', this.state.dataSource.status);
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
                            SharedPreference.notipayslipID,
                            [
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
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

        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
            });
        } else if (code.NODATA == data.code) {
            this.props.navigation.navigate(rount, {
                //  DataResponse: data.data,
            });
        } else if (code.INVALID_AUTH_TOKEN == data.code) {
            this.onAutenticateErrorAlertDialog(data)

        } else {
            this.onLoadErrorAlertDialog(data, rount)
        }

    }


    loadClockInOutDetailfromAPI = async () => {


        let today = new Date();
        let url = SharedPreference.CLOCK_IN_OUT_API + SharedPreference.profileObject.employee_id + '&month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        this.APIClockInOutCallback(await RestAPI(url, SharedPreference.FUNCTIONID_CLOCK_IN_OUT), 'ClockInOutSelfView')
    }

    loadOTSummarySelffromAPI = async () => {
        let today = new Date();
        let url = SharedPreference.OTSUMMARY_DETAIL + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        let data = await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate('OTSummarySelfView', {
                DataResponse: data.data,
            });

        } else if (code.NODATA == data.code) {
            this.props.navigation.navigate('OTSummarySelfView', {
                // DataResponse: data.data,
            });
        } else if (code.INVALID_AUTH_TOKEN == data.code) {
            this.onAutenticateErrorAlertDialog(data)

        } else {

            this.onLoadErrorAlertDialog(data, 'OTSummary')
        }

    }

    loadHandbooklistfromAPI = async () => {
        //console.log("loadHandbooklistfromAPI", SharedPreference.HANDBOOK_LIST)

        this.APICallback(await RestAPI(SharedPreference.HANDBOOK_LIST, SharedPreference.FUNCTIONID_HANDBOOK), 'Handbooklist')
        // this.props.navigation.navigate('Handbooklist');

    }

    loadOTLineChartfromAPI = async () => {
        let today = new Date();
        let url = SharedPreference.OTSUMMARY_LINE_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY), 'OTLineChartView', 0)
    }

    loadOTBarChartfromAPI = async () => {
        let today = new Date();
        let url = SharedPreference.OTSUMMARY_BAR_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY), 'OTBarChartView', 0)
    }

    loadOrgStructerfromAPI = async () => {


        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        console.log('org url : ', url);
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrgStructure', 1)
    }

    loadOrgStructerClockInOutfromAPI = async () => {
        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode
        console.log('org url : ', url);
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrgStructure', 2)
    }

    loadOrgStructerOTAveragefromAPI = async () => {
        let url = SharedPreference.ORGANIZ_STRUCTURE_OT_API + orgcode
        console.log('org url : ', url);
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE), 'OrganizationOTStruct', 1)
    }

    loadOrgStructerOTHistoryfromAPI = async () => {
        let url = SharedPreference.ORGANIZ_STRUCTURE_OT_API + orgcode
        console.log('org url : ', url);
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

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)

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

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)


        } else {

            this.onLoadErrorAlertDialog(data, rount)
        }
    }

    // Alert Error

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
                    this.select_sign_out()
                }
            }],
            { cancelable: false }
        )

        console.log("error : ", error)
    }

    // onNodataErrorAlertDialog(rount) {
    //     this.setState({
    //         isscreenloading: false,
    //     })

    //     Alert.alert(
    //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
    //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
    //         [{
    //             text: 'OK', onPress: () => {

    //             }
    //         }],
    //         { cancelable: false }
    //     )

    //     console.log("error : ", error)
    // }

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

        // console.log("error : ", error)
    }

    onLoadErrorAlertDialog(error, resource) {

        this.setState({
            isscreenloading: false,
        })
        // console.log('error message : ',error.data[0])
        if (this.state.isConnected) {
            Alert.alert(
                // 'MHF00001ACRI',
                // 'Cannot connect to server. Please contact system administrator.',
                error.data[0].code,
                error.data[0].detail,

                [{
                    text: 'OK', onPress: () => console.log('OK Pressed')
                }],
                { cancelable: false }
            )
        } else {
            //inter net not connect
            Alert.alert(
                // 'MHF00002ACRI',
                // 'System Error (API). Please contact system administrator.',
                'MHF00500AERR',
                'Cannot connect to the internet.',
                [{
                    text: 'OK', onPress: () => {
                        //console.log("onLoadErrorAlertDialog")
                    }
                }],
                { cancelable: false }
            )
        }
        //console.log("error : ", error)
    }


    loadLeaveQuotafromAPI = async () => {
        let data = await RestAPI(SharedPreference.LEAVE_QUOTA_API, SharedPreference.FUNCTIONID_LEAVE_QUOTA)
        code = data[0]
        data = data[1]
        //console.log("nonPayRollCallback data : ", data)
        this.setState({
            isscreenloading: false,
        })
        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate('LeavequotaList', {
                dataResponse: data,
            });
        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)

            // } else if (code.NODATA == data.code) {

            //     Alert.alert(
            //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            //         StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            //         [{
            //             text: 'OK', onPress: () => {

            //             }
            //         }],
            //         { cancelable: false }
            //     )

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
        //console.log("calendarCallback : ", data)
        this.props.navigation.navigate('calendarYearView', {
            dataResponse: data,
            selectYear: new Date().getFullYear(),
            location: company,
            page: 1
        });
    }

    //*****************************************************************************
    //*********************** Check API before change screen  **********************
    //*****************************************************************************


    onOpenOrgaStructer() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerfromAPI()
        });

    }
    onOpenOrgaStructerClockInOut() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerClockInOutfromAPI()
        });
    }

    onOpenOrgaStructerOTHistory() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerOTHistoryfromAPI()
        });
    }

    onOpenOrgaStructerOTAverage() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerOTAveragefromAPI()
        });
    }


    onOpenOrgaStructerOTHistory() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOrgStructerOTHistoryfromAPI()
        });
    }

    onOpenAnnouncement() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementfromAPI()
        });
    }

    onOpenAnnouncementDetail(item, index) {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            //console.log('index :', index);
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementDetailfromAPI(item, index)
        });
    }

    onOpenEmployeeInfo() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadEmployeeInfoformAPI()
        });
    }

    onOpenNonpayroll() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadNonpayrollfromAPI()
        });
    }

    onOpenPayslip() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadPayslipfromAPI()
        });
    }

    onOpenPayslipDetail() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadPayslipDetailfromAPI()
        });
    }
    onOpenAnnouncementDetailnoti() {
        console.log("onOpenAnnouncementDetailnoti")
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementDetailfromAPINoti()
        });
    }

    onOpenLeaveQuota() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadLeaveQuotafromAPI()
        });
    }

    onOpenClockInOut() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadClockInOutDetailfromAPI()
        });
    }

    onOpenOTSummarySelf() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadOTSummarySelffromAPI()
        });
    }

    onOpenCalendar() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadCalendarfromAPI()
        });
    }

    onOpenHandbook() {
        this.setState({
            isscreenloading: true,
            loadingtype: 3
        }, function () {
            this.setState(this.renderloadingscreen())
            this.loadHandbooklistfromAPI()
        });
    }

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
            // check permission announcement
            if (announcestatus == false) {
                return
            }
            //load data befor open announcement screen in first time
            if (announcementData.length) {
                page = tabnumber
                this.setState({

                });
            } else {
                page = tabnumber
                this.setState({

                    isscreenloading: true,
                    loadingtype: 3
                }, function () {
                    this.loadAnnouncementfromAPI()
                });
            }
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
        if (ascendingSort == false) {
            ascendingSort = true;
            sortImageButton = require('./../resource/images/ascending.png');
        }
        else {
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
    }

    select_announce_type = () => {
        this.setState({
            loadingtype: 0
        }, function () {
            this.setState(this.select_search_announce())
        });
    }

    select_announce_status = () => {
        this.setState({
            loadingtype: 1
        }, function () {
            this.setState(this.select_search_announce())
        });
    }

    select_announce_all_type = () => {
        this.setState({
            announcementType: 'All',
            announcementTypetext: 'All'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_company_type = () => {
        this.setState({
            announcementType: 'All',
            announcementTypetext: 'All'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_company_type = () => {
        this.setState({
            announcementType: 'Company Announcement',
            announcementTypetext: 'Company Announcement'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_emergency_type = () => {
        this.setState({
            announcementType: 'Emergency Announcement',
            announcementTypetext: 'Emergency Announcement'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_event_type = () => {
        this.setState({
            announcementType: 'Event Announcement',
            announcementTypetext: 'Event Announcement'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_general_type = () => {
        this.setState({
            announcementType: 'General Announcement',
            announcementTypetext: 'General Announcement'
        }, function () {
            this.setState(this.select_announce_type())
        });
    }

    select_announce_all_status = () => {
        this.setState({
            announcementStatus: 'All',
            announcementStatustext: 'All'
        }, function () {
            this.setState(this.select_announce_status())
        });
    }

    select_announce_read_status = () => {
        this.setState({
            announcementStatus: true,
            announcementStatustext: 'Read'
        }, function () {
            this.setState(this.select_announce_status())
        });
    }

    select_announce_unread_status = () => {
        this.setState({
            announcementStatus: false,
            announcementStatustext: 'Unread'
        }, function () {
            this.setState(this.select_announce_status())
        });
    }

    select_search_announce = () => {

        if (this.state.isscreenloading === false) {

            this.setState({

                isscreenloading: true,

            }, function () {

                this.setState(this.renderloadingscreen())
            });

        } else {
            tempannouncementData = []

            announcementData.map((item, i) => {

                if (this.state.announcementStatus === 'All') {

                    if (this.state.announcementType === 'All') {

                        tempannouncementData.push(item)

                    } else {

                        if (item.category === this.state.announcementType) {
                            ////console.log(item)
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

    onChangeFunction(newState) {
        //console.log("onChangeFunction ==> ", newState)

        this.setState({
            syncCalendar: newState.syncCalendar
        });
        SharedPreference.calendarAutoSync = newState.syncCalendar
        this.saveAutoSyncCalendar.setAutoSyncCalendar(newState.syncCalendar)
        //console.log("onChangeFunction ==> calendarAutoSync ==>  ", SharedPreference.calendarAutoSync)
    }

    // onChangeFunction = () => this.setState(state => ({
    //     syncCalendar: !state.syncCalendar
    // }))

    // onSetWhenSwitch() {
    //     //console.log("onSetWhenSwitch : ", this.state.syncCalendar)
    //     this.saveAutoSyncCalendar.setAutoSyncCalendar(this.state.syncCalendar)
    // }

    /*************************************************************** */
    /*************************   render class ********************** */
    /*************************************************************** */

    renderhomeview() {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.mainmenutabbarstyle} />
                <View style={styles.mainscreen}>
                    <Image
                        style={{ flex: 1 }}
                        source={require('./../resource/images/mainscreen.png')}
                    // resizeMode="contain" 
                    />
                    <View style={{ position: 'absolute', height: '40%', width: '80%', marginTop: '7%', marginLeft: '6%' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                <Image

                                    style={{ width: '80%', height: '80%' }}
                                    source={require('./../resource/images/people.png')}
                                    resizeMode="contain"
                                />

                            </View>
                            <View style={{ flex: 2, justifyContent: 'center', flexDirection: 'column' }}>
                                <View style={{ flex: 1, }} />
                                <View style={{ flex: 1, }}>
                                    <Text style={[styles.userTitleText, { fontFamily: "Prompt-Bold" }]}>Welcome</Text>
                                </View>
                                <View style={{ flex: 1, }}>
                                    <Text style={styles.usernameText}>{this.state.username}</Text>
                                </View>
                                <View style={{ flex: 1, }} />
                                {/* Device Info */}
                                <Text>{"Version : " + SharedPreference.deviceInfo.buildNumber}</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuEmployee.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>

                                    <Text style={styles.mainmenuTextname}>Employee</Text>
                                    <Text style={styles.mainmenuTextname}>Information</Text>

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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuNonpayroll.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Non Payroll</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuPayslip.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Pay Slip</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuLeave.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Leave Quota</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuClock.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Clock In / Out</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuOT.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>OT Summary</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref='MHF01411WorkingCalendar'
                            // disabled={!rolemanagementEmpoyee[6]}
                            style={{ flex: 1 }}
                            onPress={this.onOpenCalendar.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.mainmenuImageButton}>
                                    <Image
                                        style={rolemanagementEmpoyee[6] === 1 ?
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuCalendar.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Calendar</Text>
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
                                            { flex: 0.7, tintColor: Colors.redTextColor } :
                                            { flex: 0.7, tintColor: Colors.lightGrayTextColor }}
                                        source={require('./../resource/images/MainMenu/MenuHandbook.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>
                                    <Text style={styles.mainmenuTextname}>Employee</Text>
                                    <Text style={styles.mainmenuTextname}>Handbooks</Text>
                                </View>
                            </View>
                        </TouchableOpacity>


                        <View style={{ flex: 1 }} >
                            <View style={styles.mainmenuImageButton}>

                            </View>
                            <View style={styles.mainmenuTextButton}>

                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )


    }

    renderannouncementheader() {

        return (
            <View style={{ flexDirection: 'column', }}>

                <View style={styles.mainmenutabbarstyle} />
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
                        <Text style={styles.navTitleTextTop}>Announcement</Text>
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


                {/* <View style={{ height: 70, flexDirection: 'row', backgroundColor: '#F20909', }}>


                    <TouchableOpacity style={{ flex: 1, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}
                        onPress={this.select_announce_sort.bind(this)}>
                        <Image
                            style={{ flex: 1, height: 30, width: 30, }}
                            source={sortImageButton}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>

                    <View style={{ flex: 5, justifyContent: 'center' }}>

                        <Text style={styles.navTitleTextTop}>Announcement</Text>

                    </View>

                    <TouchableOpacity style={{ flex: 1, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}
                        onPress={this.expand_collapse_Function}>
                        <Image
                            style={{ flex: 1, height: 30, width: 30, }}
                            source={filterImageButton}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                </View> */}

                <View style={{ height: expandheight, }}>
                    <View style={{ height: 50, marginLeft: 10, marginRight: 10, flexDirection: 'row', }}>
                        <View style={{ flex: 2, justifyContent: 'center' }} >
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Type</Text>
                        </View>
                        <View style={{ flex: 7, justifyContent: 'center' }} >
                            <View style={{ height: 25, justifyContent: 'center', backgroundColor: 'lightgray', borderRadius: 3, }} >
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={(this.select_announce_type.bind(this))}
                                >
                                    <Text style={{ textAlign: 'left', color: Colors.redTextColor, fontSize: 12, marginLeft: 10 }}>{this.state.announcementTypetext}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 2, justifyContent: 'center' }} >
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Status</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }} >
                            <View style={{ height: 25, justifyContent: 'center', backgroundColor: 'lightgray', borderRadius: 3, }} >
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={(this.select_announce_status.bind(this))}
                                >
                                    <Text style={{ textAlign: 'left', color: Colors.redTextColor, fontSize: 12, marginLeft: 10 }}>{this.state.announcementStatustext}</Text>
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
            <View style={{ backgroundColor: 'green', flex: 1 }}>

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
                        // onScrollEndDrag={(event) => {
                        var windowHeight = Dimensions.get('window').height,
                            height = event.nativeEvent.contentSize.height,
                            offset = event.nativeEvent.contentOffset.y;
                        //console.log('windowHeight : ', windowHeight - 120 - expandheight)

                        if ((height - (windowHeight - 120 - expandheight) < offset) & (this.state.enddragannounce)) {
                            //console.log('load more')
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

                            <View key={item.id} style={item.attributes.read === false ? styles.announcementitemUnread : styles.announcementitemRead}>

                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ flex: 1 }}

                                        onPress={() => { this.onOpenAnnouncementDetail(item, index) }}>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                                <Image
                                                    style={{ height: 40, width: 40 }}
                                                    source={item.category === 'Emergency Announcement' || item.category === 'Event Announcement' ?
                                                        item.category === 'Event Announcement' ? require('./../resource/images/Event.png') : require('./../resource/images/Emergency.png') :
                                                        item.category === 'Company Announcement' ? require('./../resource/images/Company.png') : require('./../resource/images/General.png')}
                                                />
                                            </View>
                                            <View style={{ flex: 5, justifyContent: 'center' }}>
                                                <Text style={{ height: 20, fontSize: 13, textAlign: 'left', fontWeight: 'bold', marginTop: 5 }}>
                                                    {annountype[item.category]}
                                                </Text>
                                                <Text style={{ height: 20, fontSize: 11, textAlign: 'left', color: 'gray' }} numberOfLines={1} ellipsizeMode={'tail'}>
                                                    {item.title}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 3, justifyContent: 'center', marginTop: 5 }}>
                                                <Text style={item.attributes.read === false ? { height: 40, fontSize: 11, textAlign: 'right', color: Colors.redTextColor } : { height: 40, fontSize: 11, textAlign: 'right', color: 'gray' }}>
                                                    {item.attributes.last_modified}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
                <View style={tempannouncementData.length === 0
                    ? { width: '100%', height: '100%', position: 'absolute', }
                    : { width: 1, height: 1, position: 'absolute', }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 25, textAlign: 'center', color: 'black' }}> No Data</Text>


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
                <View style={styles.mainmenutabbarstyle} />
                <View style={{ height: 50, flexDirection: 'row', backgroundColor: '#F20909', }}>

                    <View style={{ flex: 5, justifyContent: 'center' }}>

                        <Text style={styles.navTitleTextTop}>Manager View</Text>

                    </View>

                </View>
                <View style={{ flex: 1, backgroundColor: 'white' }} >
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref=''
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructer.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={{ flex: 0.5 }}
                                        source={require('./../resource/images/MainMenu/MenuEmployee.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.mainmenuTextButton}>

                                    <Text style={styles.managermenuTextname}>Employee</Text>
                                    <Text style={styles.managermenuTextname}>Information</Text>

                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref=''
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerClockInOut.bind(this)}
                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={{ flex: 0.5 }}
                                        source={require('./../resource/images/MainMenu/MenuClock.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>
                                    <Text style={styles.managermenuTextname}>Clock In/Out</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
                            ref=''
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerOTAverage.bind(this)}

                        >
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={{ flex: 0.5 }}
                                        source={require('./../resource/images/MainMenu/MenuAverage.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>
                                    <Text style={styles.managermenuTextname}>Overtime Average</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            ref=''
                            style={{ flex: 1 }}
                            onPress={this.onOpenOrgaStructerOTHistory.bind(this)}>
                            <View style={[styles.boxShadow, shadow]} >
                                <View style={styles.managermenuImageButton}>
                                    <Image
                                        style={{ flex: 0.5 }}
                                        source={require('./../resource/images/MainMenu/MenuHistory.png')}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.managermenuTextButton}>

                                    <Text style={styles.managermenuTextname}>Overtime</Text>
                                    <Text style={styles.managermenuTextname}>History Information</Text>

                                </View>
                            </View>
                        </TouchableOpacity>



                    </View>

                </View>
            </View>
        )
    }

    rendersettingview() {
        //console.log("rendersettingview ==> this.state.syncCalendar : 1 ", this.state.syncCalendar)
        //console.log("rendersettingview ==> SharedPreference.calendarAutoSync : 2 ", SharedPreference.calendarAutoSync)

        return (
            <View style={{ flex: 1, flexDirection: 'column', }}>
                <View style={styles.mainmenutabbarstyle} />
                <View style={{ height: 50, flexDirection: 'row', backgroundColor: '#F20909', }}>

                    <View style={{ flex: 5, justifyContent: 'center' }}>

                        <Text style={styles.navTitleTextTop}>Setting</Text>

                    </View>


                </View>
                <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <TouchableOpacity
                        onPress={(this.onChangePIN.bind(this))}>
                        <Text style={styles.settinglefttext}>Change PIN</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <View style={{ flex: 4, justifyContent: 'center' }}>
                        <Text style={styles.settinglefttext}>Sync Calendar</Text>

                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {/* <Switch
                            // onTintColor="red"
                            // onValueChange={(value) => this.onChangeFunction({ syncCalendar: value })}
                            // onValueChange={SharedPreference.syncCalendar}
                            // value={SharedPreference.syncCalendar} />
                            /> */}
                        <Switch
                            // onValueChange={this.onChangeFunction}
                            onValueChange={(value) => this.onChangeFunction({ syncCalendar: value })}
                            value={this.state.syncCalendar}
                        />
                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <View style={{ flex: 2, justifyContent: 'center' }}>

                        <Text style={styles.settinglefttext}>Application Name</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.settingrighttext}>TDEM Connect</Text>

                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <View style={{ flex: 2, justifyContent: 'center' }}>

                        <Text style={styles.settinglefttext}>Application Version</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.settingrighttext}>{SharedPreference.deviceInfo.appVersion}</Text>

                    </View>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <TouchableOpacity
                        onPress={(this.select_sign_out.bind(this))}>
                        <Text style={styles.settingleftredtext}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 8 }}>


                </View>
            </View>
        )

    }

    select_sign_out() {

        page = 0
        timerstatus = false
        SharedPreference.Handbook = []
        SharedPreference.profileObject = null
        this.saveProfile.setProfile(null)
        this.props.navigation.navigate('RegisterScreen')
    }

    onChangePIN() {
        this.props.navigation.navigate('ChangePINScreen')
    }

    renderpickerview() {
        if (this.state.loadingtype == 1) {

            if (Platform.OS === 'android') {
                return (
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Status</Text>
                            </View>
                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_all_type)}

                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}>All</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}

                                onPress={(this.select_announce_read_type)}
                            >

                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}>Read</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_unread_status)}

                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}>Unread</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                )

            }

            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Status</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.announcementStatus}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                announcementStatus: itemValue,
                                announcementStatustext: announstatus[itemValue],

                            }, function () {
                                initannouncementStatustext = announstatus[itemValue];
                                initannouncementStatus = itemValue;
                            })}>
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="Read" value={true} />
                            <Picker.Item label="Unread" value={false} />
                        </Picker>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 50, alignItems: 'center', }}>
                            <TouchableOpacity style={styles.button} onPress={(this.select_announce_status)}>
                                <Text style={{ textAlign: 'center', color: Colors.redTextColor, fontSize: 18, width: 80, height: 30, alignItems: 'center' }}> OK</Text>
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
                                <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Type</Text>
                            </View>

                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_all_type)}
                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 18, width: 80, height: 30, alignItems: 'center' }}> All</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_company_type)}
                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, width: '100%', height: 30, alignItems: 'center' }}>Company Announcement</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_emergency_type)}
                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, width: '100%', height: 30, alignItems: 'center' }}>Emergency Announcement</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_event_type)}
                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, width: '100%', height: 30, alignItems: 'center' }}>Event Announcement</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}
                                onPress={(this.select_announce_general_type)}
                            >
                                <View style={{ justifyContent: 'center', height: 50, alignItems: 'center', }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, width: '100%', height: 30, alignItems: 'center' }}> General Announcement</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )

            }
            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Type</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.announcementType}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                announcementType: itemValue,
                                announcementTypetext: annountype[itemValue],
                            }, function () {

                                initannouncementType = itemValue;
                                initannouncementTypetext = annountype[itemValue];

                            })}>
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="Company Announcement" value="Company Announcement" />
                            <Picker.Item label="Emergency Announcement" value="Emergency Announcement" />
                            <Picker.Item label="Event Announcement" value="Event Announcement" />
                            <Picker.Item label="General Announcement" value="General Announcement" />
                        </Picker>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 50, alignItems: 'center', }}>
                            <TouchableOpacity style={styles.button} onPress={(this.select_announce_type)}>
                                <Text style={{ textAlign: 'center', color: Colors.redTextColor, fontSize: 18, width: 80, height: 30, alignItems: 'center' }}> OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )

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
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>
                    </View>
                    {this.renderpickerview()}
                </View>
            )
        }

    }
    pushnodetailscreen() {

        //  if (this.state.isscreenloading) {
        return (
            <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>
                </View>

            </View>
        )
        // }

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
    render() {
        let badgeBG = 'transparent'
        let badgeText = 'transparent'
        if (SharedPreference.notiAnnounceMentBadge) {
            badgeBG = 'red'
            badgeText = 'white'
        }
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    {/* <View style={{ height: 1, }} /> */}
                    <View style={{ flex: 1 }} >
                        {this.redertabview()}
                    </View>
                    <View style={{ height: 1, backgroundColor: Colors.lightGrayTextColor }} />

                    <View style={{ height: 50, flexDirection: 'row', }} >

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


                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(1) }}>

                            <Image
                                style={page === 1 ?
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                                }
                                source={require('./../resource/images/announcement_icon.png')}
                                resizeMode='contain'
                            />
                            <View style={{ position: 'absolute', height: '100%' }}  >
                                <View style={{ height: 20, borderRadius: 20, backgroundColor: badgeBG, marginLeft: 20, marginTop: 10 }}>
                                    <Text style={{ fontSize: 15, color: badgeText, textAlign: 'center', marginLeft: 5, marginRight: 5, height: 20, borderRadius: 10 }}>{SharedPreference.notiAnnounceMentBadge}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                        {this.rendermanagertab()}
                        {/* <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(2) }}>

                            <Image
                                style={page === 2 ?
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.redTextColor } :
                                    { width: ICON_SIZE, height: ICON_SIZE, tintColor: Colors.lightGrayTextColor }
                                }
                                source={require('../assets/images/manager_icon.png')}
                                resizeMode='contain'
                            />

                        </TouchableOpacity> */}
                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.settabscreen(3) }}>

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

            </View>
        );
    }
}

const shadow = {
    shadowColor: 'black',
    shadowOpacity: 0.1,
    elevation: 2,
    shadowOffset: { width: 0, height: 3 }
}