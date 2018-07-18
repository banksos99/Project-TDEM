import React, { Component } from "react";
import {
    View, Text, TouchableOpacity, Picker,
    Image, Switch, ActivityIndicator, ScrollView,
    Button, RefreshControl, Alert, NetInfo,
    Platform, Dimensions
} from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from "./../SharedObject/Colors"
import SharedPreference from "./../SharedObject/SharedPreference"

import payslipDataResponse from "./../InAppData/Payslipdatalist"
import announcementDataResponse from "./../InAppData/Announcementdata"
import leaveQuotaDataResponse from "./../InAppData/Leavequotalistdata"
import HandbookshelfDataResponse from "./../InAppData/HandbookListData"
import OTSelfDataResponse from "./../InAppData/OTSummarySelfData"

// import nonPayRollAPI from "../api/NonPayRollAPI"

import RestAPI from "../constants/RestAPI"

const ROLL_ANNOUNCE = 10;

let annountype = { 'All': 'All', 'Company Announcement': 'Company Announcement', 'Emergency Announcement': 'Emergency Announcement', 'Event Announcement': 'Event Announcement', 'General Announcement': 'General Announcement' };
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
let orgcode = 60162305;

let managerstatus = false;
let announcestatus = false;
let rolemanagementEmpoyee = [1,1,1,1,1,1,0,0];
let rolemanagementManager = [0,0,0,0];

export default class HMF01011MainView extends Component {

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
            // username:"hello hello"

        }
        console.log("MainView ====> profileObject ==> ", SharedPreference.profileObject)
        console.log("MainView ====> profileObject ==> employee_name ==> ", SharedPreference.profileObject.employee_name)

    }


    componentDidMount() {
        this.setState({
            page: 0,
        })
        this.redertabview()
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    }

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

        this.setState({
            loadingtype: 3,
            isscreenloading: true,
            refreshing: true,
            annrefresh: true,
            page: 1
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

        this.setState({
            loadingtype: 3,
            isscreenloading: true,
            loadmore: true,
            // refreshing: true,
            page: 1,

        });

        let promise = this.loadAnnouncementMorefromAPI();

        // if (!promise) {
        //     return;
        // }

        // promise.then(() => this.setState({
        //     loadmore: false
        // }));

    }

    // loadAnnouncementfromAPI = async () => {
    //     let url = SharedPreference.ANNOUNCEMENT_ASC_API
    //     if (ascendingSort) {
    //         url = SharedPreference.ANNOUNCEMENT_DSC_API
    //     }
    //     this.announcementCallback(await RestAPI(url))
    // }
    // announcementCallback(data) {
    //     code = data[0]
    //     data = data[1]
    //     if (code.SUCCESS == data.code) {//200
    //         this.setState(this.renderloadingscreen());
    //         tempannouncementData = []
    //         announcementData = this.state.dataSource.data;
    //         announcementData.map((item, i) => {
    //             if (this.state.announcementStatus === 'All') {
    //                 if (this.state.announcementType === 'All') {
    //                     tempannouncementData.push(item)
    //                 } else {
    //                     if (item.category === this.state.announcementType) {
    //                         tempannouncementData.push(item)
    //                     }
    //                 }
    //             } else {
    //                 if (item.attributes.read === this.state.announcementStatus) {
    //                     if (this.state.announcementType === 'All') {
    //                         tempannouncementData.push(item)
    //                     } else {
    //                         if (item.category === this.state.announcementType) {
    //                             tempannouncementData.push(item)
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //         this.setState(this.renderannouncementbody());
    //     } else {
    //         this.onLoadErrorAlertDialog(data)
    //     }
    // }

    loadAnnouncementfromAPI() {

        let totalroll = announcementData.length;

        if (this.state.annrefresh) {

            totalroll = ROLL_ANNOUNCE;

        } else if (!totalroll) {

            totalroll = ROLL_ANNOUNCE

        }

        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=0&limit=' + totalroll
        if (ascendingSort) {
            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=0&limit=' + totalroll
        }
        return fetch(hostApi, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: SharedPreference.TOKEN,
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
                    this.onLoadErrorAlertDialog(error)
                });
            });
    }

    loadAnnouncementMorefromAPI() {

        let hostApi = SharedPreference.ANNOUNCEMENT_ASC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        if (ascendingSort) {
            hostApi = SharedPreference.ANNOUNCEMENT_DSC_API + '&offset=' + announcementData.length + '&limit=' + ROLL_ANNOUNCE
        }
        console.log('hostApi :', hostApi)

        return fetch(hostApi, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: SharedPreference.TOKEN,
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

                        console.log('this.state.dataSource.data :', this.state.dataSource.data)
                        console.log('this.state.dataSource.status :', this.state.dataSource.status)
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
                            console.log('announcementData :', announcementData.length)
                            this.setState(this.renderannouncementbody());
                            // } else {
                            //     Alert.alert(
                            //         this.state.dataSource.errors[0].code,
                            //         this.state.dataSource.errors[0].detail,
                            //         [
                            //             { text: 'OK', onPress: () => console.log('OK Pressed') },
                            //         ],
                            //         { cancelable: false }
                            //     )
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
                    this.onLoadErrorAlertDialog(error)
                });
            });


    }
    loadAnnouncementDetailfromAPI(item, index) {

        let path = 'AnnouncementDetail'
        return fetch(SharedPreference.ANNOUNCEMENT_DETAIL_API + item.id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer MS5IRjAxLmJjZGE4OGIyNzVjMjc1Yzg0MDU1ZDhlYWRlMGJmOTFlNDg4YTI1MGUyOTc0MjUxODUxMzk1ZjgwMWQ3ZGY3YTYyZGQ4YmUyOTE3OWViOGFlMGUwY2Y2NjIxNjViZmRkNjdiMzk5NzJjOGJiOGZlN2QwNWExZTIxNDU2M2YxOTZl',
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {

                try {
                    this.setState({

                        isscreenloading: false,
                        announceDetailDataSource: responseJson,
                    }, function () {

                        tempannouncementData[index].attributes.read = true

                        this.props.navigation.navigate(path, {
                            DataResponse: this.state.announceDetailDataSource,
                        });

                    });

                } catch (error) {

                    //console.log('erreo1 :', error);

                }
            })
            .catch((error) => {

                this.setState({

                    isscreenloading: false,

                }, function () {

                    this.setState(this.renderloadingscreen());

                    Alert.alert(

                        'MHF00002ACRI',
                        'System Error (API). Please contact system administrator.',
                        [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ],
                        { cancelable: false }
                    )

                    console.log(error);
                });

            });
    }

    loadEmployeeInfoformAPI = async () => {

        console.log("loadEmployeeInfoformAPI :", SharedPreference.profileObject.employee_id)
        this.APICallback(await RestAPI(SharedPreference.EMP_INFO_CAREERPATH_API + SharedPreference.profileObject.employee_id), 'EmployeeInfoDetail')

    }

    loadNonpayrollfromAPI = async () => {

        let data = await RestAPI(SharedPreference.NONPAYROLL_SUMMARY_API)
        code = data[0]
        data = data[1]

        if ((code.SUCCESS == data.code) | (code.NODATA == data.code)) {
            this.props.navigation.navigate('NonPayrollList', {
                dataResponse: data.data,
            });
        } else {
            this.onLoadErrorAlertDialog(data)
        }
    }

    loadPayslipfromAPI = async () => {

        let data = await RestAPI(SharedPreference.PAYSLIP_LIST_API)
        code = data[0]
        data = data[1]

        if ((code.SUCCESS == data.code) | (code.NODATA == data.code)) {
            this.props.navigation.navigate('PayslipList', {
                dataResponse: data.data,
            });
        } else {
            this.onLoadErrorAlertDialog(data)
        }

    }

    loadClockInOutDetailfromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.CLOCK_IN_OUT_API + SharedPreference.profileObject.employee_id + '&month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

        this.APIClockInOutCallback(await RestAPI(url), 'ClockInOutSelfView')

    }

    loadOTSummarySelffromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.OTSUMMARY_DETAIL + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

        this.APICallback(await RestAPI(url), 'OTSummarySelfView')

    }
    loadHandbooklistfromAPI = async () => {
        console.log("loadHandbooklistfromAPI")

        // this.APICallback(await RestAPI(SharedPreference.HANDBOOK_LIST), 'Handbooklist')
        this.props.navigation.navigate('Handbooklist');

    }

    loadOTLineChartfromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.OTSUMMARY_LINE_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

        this.APICallback(await RestAPI(url), 'OTLineChartView', 0)

    }

    loadOTBarChartfromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.OTSUMMARY_BAR_CHART + 'month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

        this.APICallback(await RestAPI(url), 'OTBarChartView', 0)

    }

    loadOrgStructerfromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode

        this.APICallback(await RestAPI(url), 'OrgStructure', 1)

    }
    loadOrgStructerClockInOutfromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.ORGANIZ_STRUCTURE_API + orgcode

        this.APICallback(await RestAPI(url), 'OrgStructure', 2)

    }

    loadOrgStructerOTAveragefromAPI = async () => {

        let today = new Date();

        let url = SharedPreference.ORGANIZ_STRUCTURE_OT_API + orgcode
        console.log('loadOrgStructerOTAveragefromAPI url : ', url)
        this.APICallback(await RestAPI(url), 'OrganizationOTStruct', 1)

    }

    loadOrgStructerOTHistoryfromAPI = async () => {
        let today = new Date();
        let url = SharedPreference.ORGANIZ_STRUCTURE_OT_API + orgcode
        this.APICallback(await RestAPI(url), 'OrganizationOTStruct', 2)
    }

    APICallback(data, rount, option) {
        console.log('main menu option :', option)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate(rount, {
                DataResponse: data.data,
                Option: option
            });
        } else {
            this.onLoadErrorAlertDialog(data)
        }
        
    }


    APIClockInOutCallback(data, rount) {

        code = data[0]
        data = data[1]

        this.setState({
            isscreenloading: false,
        })

        if ((code.SUCCESS == data.code) | (code.NODATA == data.code)) {

            this.props.navigation.navigate(rount, {
                DataResponse: data,
            });

        } else {
            this.onLoadErrorAlertDialog(data)
        }

    }

    onLoadErrorAlertDialog(error) {
        this.setState({
            isscreenloading: false,
        })

        if (this.state.isConnected) {
            Alert.alert(
                'MHF00001ACRI',
                'Cannot connect to server. Please contact system administrator.',
                [{
                    text: 'OK', onPress: () => console.log('OK Pressed')
                }],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                'MHF00002ACRI',
                'System Error (API). Please contact system administrator.',
                [{
                    text: 'OK', onPress: () => {
                        console.log("onLoadErrorAlertDialog")
                    }
                }],
                { cancelable: false }
            )
        }
        console.log("error : ", error)
    }

    loadLeaveQuotafromAPI = async () => {
        let data = await RestAPI(SharedPreference.LEAVE_QUOTA_API)
        code = data[0]
        data = data[1]
        console.log("nonPayRollCallback data : ", data)

        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate('LeavequotaList', {
                dataResponse: data,
            });
        } else {
            this.onLoadErrorAlertDialog(data)
        }
    }

    loadLeaveQuotafromAPI = async () => {
        this.leaveQuotaCallback(await RestAPI(SharedPreference.LEAVE_QUOTA_API))
    }

    leaveQuotaCallback(data) {
        code = data[0]
        data = data[1]

        this.props.navigation.navigate('LeavequotaList', {
            dataResponse: data
        });
    }

    loadCalendarfromAPI = async (location) => {
        console.log("location : ", location)
        let year = new Date().getFullYear()
        let company = SharedPreference.profileObject.location
        if (company == null) {
            company = "TA"
        }
        this.calendarCallback(await RestAPI(SharedPreference.CALENDER_YEAR_API + year + '&company=' + company))
    }

    calendarCallback(data) {

        let company = SharedPreference.profileObject.location
        if (company == null) {
            company = "TA"
        }

        code = data[0]
        data = data[1]
        console.log("calendarCallback : ", data)
        this.props.navigation.navigate('calendarYearView', {
            dataResponse: data,
            selectYear: new Date().getFullYear(),
            location: company
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
            console.log('index :', index);
            this.setState(this.renderloadingscreen())
            this.loadAnnouncementDetailfromAPI(item, index)

        });

    }

    onOpenEmployeeInfo() {

        if (rolemanagementEmpoyee[0]) {

            this.setState({
                isscreenloading: true,
                loadingtype: 3
            }, function () {
                this.setState(this.renderloadingscreen())
                this.loadEmployeeInfoformAPI()
            });
        }
    }

    onOpenNonpayroll() {

        if (rolemanagementEmpoyee[1]) {

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.setState(this.renderloadingscreen())
                this.loadNonpayrollfromAPI()

            });

        }
    }

    onOpenPayslip() {

        if (rolemanagementEmpoyee[2]) {

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.setState(this.renderloadingscreen())
                this.loadPayslipfromAPI()
            });

        }
    }

    onOpenLeaveQuota() {

        if (rolemanagementEmpoyee[3]) {

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.setState(this.renderloadingscreen())
                this.loadLeaveQuotafromAPI()
            });

        }

    }

    onOpenClockInOut() {

        if(rolemanagementEmpoyee[4]){

            this.setState({

                isscreenloading: true,
                loadingtype: 3
    
            }, function () {
    
                this.setState(this.renderloadingscreen())
                this.loadClockInOutDetailfromAPI()
    
    
            });

        }
        
    }

    onOpenOTSummarySelf() {

        if (rolemanagementEmpoyee[5]) {
            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.setState(this.renderloadingscreen())
                this.loadOTSummarySelffromAPI()
            });

            // this.props.navigation.navigate('OTSummaryDetail', {
            //     DataResponse: leaveQuotaDataResponse.dataSource,
            // });

        }
    }

    onOpenCalendar() {
        if (rolemanagementEmpoyee[6]) {

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {
                // this.props.navigation.navigate('CalendarActivity');
                this.setState(this.renderloadingscreen())
                this.loadCalendarfromAPI()
            });
        }
    }

    onOpenHandbook() {

        if (rolemanagementEmpoyee[7]) {
            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.setState(this.renderloadingscreen())
                this.loadHandbooklistfromAPI()


            });

            // this.props.navigation.navigate('Handbooklist', {
            //     DataResponse: HandbookshelfDataResponse.dataSource,
            // })
        }

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

    // setEventIDFromDevice(eventArray) {
    //     return AsyncStorage.setItem(this.state.calendarName, JSON.stringify(eventArray))
    //         .then(json => console.log('success!'))
    //         .catch(error => console.log('error!'));
    // }
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
                page = tabnumber;
                this.setState({


                });
            } else {
                page = tabnumber;
                this.setState({

                    isscreenloading: true,
                    loadingtype: 3
                }, function () {
                    this.loadAnnouncementfromAPI()
                });


            }


        } else {
            page = tabnumber;
            this.setState({


            });
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

            // tempannouncementData.sort(function (a, b) {
            //     return a.index - b.index;
            // });
            ascendingSort = true;
            sortImageButton = require('./../resource/images/ascending.png');

        }
        else {

            // tempannouncementData.sort(function (a, b) {
            //     return b.index - a.index;
            // });

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


        // this.setState({});
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

        //console.log('select_announce_read_type')

        this.setState({

            announcementType: 'Emergency Announcement',
            announcementTypetext: 'Emergency Announcement'
        }, function () {

            this.setState(this.select_announce_type())
        });

    }
    select_announce_event_type = () => {

        //console.log('select_announce_read_type')

        this.setState({

            announcementType: 'Event Announcement',
            announcementTypetext: 'Event Announcement'
        }, function () {

            this.setState(this.select_announce_type())
        });

    }
    select_announce_general_type = () => {

        //console.log('select_announce_read_type')

        this.setState({

            announcementType: 'General Announcement',
            announcementTypetext: 'General Announcement'
        }, function () {

            this.setState(this.select_announce_type())
        });

    }

    select_announce_all_status = () => {

        //console.log('select_announce_read_type')

        this.setState({

            announcementStatus: 'All',
            announcementStatustext: 'All'
        }, function () {

            this.setState(this.select_announce_status())
        });

    }
    select_announce_read_status = () => {

        //console.log('select_announce_read_type')

        this.setState({

            announcementStatus: true,
            announcementStatustext: 'Read'
        }, function () {

            this.setState(this.select_announce_status())
        });

    }
    select_announce_unread_status = () => {

        //console.log('select_announce_read_type')

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
                            //console.log(item)
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
                        resizeMode="contain"
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
                        <TouchableOpacity style={{ flex: 1 }}
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

                        <TouchableOpacity style={{ flex: 1 }}
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

                        <TouchableOpacity style={{ flex: 1 }}
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

                        <TouchableOpacity style={{ flex: 1 }}
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
                        console.log('windowHeight : ', windowHeight - 120 - expandheight)

                        if ((height - (windowHeight - 120 - expandheight) < offset) & (this.state.enddragannounce)) {
                            console.log('load more')
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

                        <TouchableOpacity style={{ flex: 1 }}
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

                        <TouchableOpacity style={{ flex: 1 }}
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
                                    <Text style={styles.managermenuTextname}>Clock In / Out</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <TouchableOpacity
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
                        onPress={(this.select_sign_out.bind(this))}>

                        <Text style={styles.settinglefttext}>Change PIN</Text>

                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <View style={{ flex: 4, justifyContent: 'center' }}>

                        <Text style={styles.settinglefttext}>Sync Calendar</Text>

                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Switch
                            value={false}
                            onTintColor="red"
                            onValueChange={(value) => this.setState({ syncCalendar: value })}
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
                        <Text style={styles.settingrighttext}>1.0.0</Text>

                    </View>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.lightGrayTextColor }}>
                    <TouchableOpacity
                        onPress={(this.select_sign_out.bind(this))}
                    >
                        <Text style={styles.settingleftredtext}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 8 }}>


                </View>
            </View>
        )

    }

    select_sign_out() {
        console.log("select_sign_out")

        SharedPreference.profileObject = null
        this.props.navigation.navigate('RegisterScreen')
    }

    renderpickerview() {

        // if (Platform.OS === 'android') {

        //     return (
        //         <View>
        //         </View>
        //     )

        // } else 
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

    rendermanagertab() {

        if (managerstatus) {

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
    // shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 2,
    shadowOffset: { width: 0, height: 3 }
}