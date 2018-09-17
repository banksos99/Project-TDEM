import React, { Component } from 'react';
import {
    createSwitchNavigator,
} from 'react-navigation';
import DeviceInfo from 'react-native-device-info';

import homeScreen from "./MHF01410MainView";
import empInfoDetail from "./MHF04011EmpInfoSelfViewView";
import nonPayrollList from "./MHF06011NonPayrollListView";
import nonPayrollDetail from "./MHF06012NonPayrollDetailView";

import payslipList from "./MHF05011PaySlipListView";
import payslipDetail from "./MHF05012PaySlipDetailView";

import leavequotaList from "./MHF09011LeaveQuotaListView";
import leavequotaDetail from "./MHF09012LeaveQuotaDetailView";

import OTSummarySelfView from "./MHF08011OTSummarySelfViewView";

import handbookList from "./MHF0A011HandbookListView";
import handbookDetail from "./MHF0A012HandbookDetailView";

import OrganizationStruct from "./MHF0B011OrganizationStruct";


import calendarYearView from "./MHF03111WorkingCalendarYearView";
import calendarYearView2 from "./MHF03111WorkingCalendarYearView2";

import calendarMonthView from "./MHF03112WorkingCalendarMonthView";
import calendarEventDetailView from "./MHF03211CalendarEventDetailView";

import clockInOutSelfView from "./MHF07011ClockInOutSelfViewView";

import registerScreen from "./MHF01210RegisterScreen";
import pinScreen from "./MHF01310PINScreen";

import SaveProfile from "../constants/SaveProfile"

import OTLineChartView from "./MHF08013OTSummaryLineGraphView";
import OTBarChartView from "./MHF08014OTSummaryBarGraphView";
import OrganizationOTStruct from "./MHF0B010OrganizationStruct";
import announcementdetail from "./MHF02011AnnouncementDetailView"

import EmployeeList from "./MHF0B012EmployeeList"

import ChangePINScreen from "./ChangePINScreen"
import SharedPreference from "../SharedObject/SharedPreference"


const AppNavigatorPin = createSwitchNavigator({
    RegisterScreen: { screen: registerScreen },
    PinScreen: { screen: pinScreen },
    HomeScreen: { screen: homeScreen },
    EmployeeInfoDetail: { screen: empInfoDetail },
    NonPayrollList: { screen: nonPayrollList },
    NonPayrollDetail: { screen: nonPayrollDetail },
    PayslipList: { screen: payslipList },
    PayslipDetail: { screen: payslipDetail },
    LeavequotaList: { screen: leavequotaList },
    LeavequotaDetail: { screen: leavequotaDetail },
    OTSummarySelfView: { screen: OTSummarySelfView },
    Handbooklist: { screen: handbookList },
    HandbookDetail: { screen: handbookDetail },
    OrgStructure: { screen: OrganizationStruct },
    calendarYearView: { screen: calendarYearView },
    calendarYearView2: { screen: calendarYearView2 },
    calendarMonthView: { screen: calendarMonthView },
    calendarEventDetailView: { screen: calendarEventDetailView },
    ClockInOutSelfView: { screen: clockInOutSelfView },
    OTLineChartView: { screen: OTLineChartView },
    OTBarChartView: { screen: OTBarChartView },
    OrganizationOTStruct: { screen: OrganizationOTStruct },
    AnnouncementDetail: { screen: announcementdetail },
    ChangePINScreen: { screen: ChangePINScreen },
    EmployeeList: { screen: EmployeeList },
}, {
        initialRouteName: 'PinScreen',
        headerMode: 'none',
        transitionConfig: () => ({
            transitionSpec: {
                duration: 0,
                timing: Animated.timing,
                easing: Easing.step0
            }
        })
    }
);

const AppNavigatorRegister = createSwitchNavigator({
    RegisterScreen: { screen: registerScreen },
    PinScreen: { screen: pinScreen },
    HomeScreen: { screen: homeScreen },
    EmployeeInfoDetail: { screen: empInfoDetail },
    NonPayrollList: { screen: nonPayrollList },
    NonPayrollDetail: { screen: nonPayrollDetail },
    PayslipList: { screen: payslipList },
    PayslipDetail: { screen: payslipDetail },
    LeavequotaList: { screen: leavequotaList },
    LeavequotaDetail: { screen: leavequotaDetail },
    OTSummarySelfView: { screen: OTSummarySelfView },
    Handbooklist: { screen: handbookList },
    HandbookDetail: { screen: handbookDetail },
    OrgStructure: { screen: OrganizationStruct },
    calendarYearView: { screen: calendarYearView },
    calendarYearView2: { screen: calendarYearView2 },
    calendarMonthView: { screen: calendarMonthView },
    calendarEventDetailView: { screen: calendarEventDetailView },
    ClockInOutSelfView: { screen: clockInOutSelfView },
    OTLineChartView: { screen: OTLineChartView },
    OTBarChartView: { screen: OTBarChartView },
    OrganizationOTStruct: { screen: OrganizationOTStruct },
    AnnouncementDetail: { screen: announcementdetail },
    ChangePINScreen: { screen: ChangePINScreen },
    EmployeeList: { screen: EmployeeList },
}, {
        initialRouteName: 'RegisterScreen',
        headerMode: 'none',
        transitionConfig: () => ({
            transitionSpec: {
                duration: 0,
                timing: Animated.timing,
                easing: Easing.step0
            }
        })
    }
);
export default class rootNavigation extends Component {

    saveProfile = new SaveProfile()
    constructor(props) {
        super(props);
        this.state = {
            hasPin: false,
            number: "111111",
            pageSelect: this.props.pageSelect,
            changePage: 0,
            type: 0
        };
    }

    async componentWillMount() {

        // if (DeviceInfo.getBundleId() == 'com.tdem.tdemconnect') {

        //     SharedPreference.HOST = 'https://tdemconnect.tdem.toyota-asia.com';
        //     SharedPreference.SERVER = 'PROD';

        // } else {

        //     SharedPreference.HOST = 'https://tdemconnect-dev.tdem.toyota-asia.com'
        //     SharedPreference.SERVER = 'Dev'
        // }

        // console.log("HOST ==>  body : ", SharedPreference.HOST)

        profile = await this.getProfileObject()
    }

    componentWillUpdate() {
        if (SharedPreference.gotoRegister == true) {
            SharedPreference.gotoRegister = false

            if (this.state.hasPin == false) {

                this.setState({
                    hasPin: true
                })

                this.timer = setTimeout(() => {
                    this.setState({
                        hasPin: false
                    })
                }, 300);

            } else {

                this.setState({
                    hasPin: false
                })
            }


        }
    }

    getProfileObject = async () => {
        profileObject = await this.saveProfile.getProfile()
        if (profileObject) {
            this.setState({
                hasPin: true
            })
        }
    }

    rendertagNotification() {
        if (this.state.notiAnnounceMentBadge) {
            return (
                <View style={{ height: 100, width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>
                    </View>
                </View>
            )
        }
    }

    inappTimeInterval() {
        this.timer = setTimeout(() => {
            this.onLoadInAppNoti()
        }, 20000);
    };

    onLoadInAppNoti() {
        console.log('onLoadInAppNoti')
       // this.inappTimeInterval()
    }
    render() {
        if (this.state.hasPin == false) {
            return (
                <AppNavigatorRegister
                    onNavigationStateChange={(prevState, currentState) => {
                        // console.log("AppNavigatorRegister ==> prevState = ", prevState)
                        // console.log("AppNavigatorRegister ==> currentState = ", currentState)
                    }} />
            );
        } else {
            return (
                <AppNavigatorPin
                    onNavigationStateChange={(prevState, currentState) => {
                        // console.log("AppNavigatorRegister ==> prevState = ", prevState)
                        // console.log("AppNavigatorRegister ==> currentState = ", currentState)
                    }} />
            );
        }

    }
}