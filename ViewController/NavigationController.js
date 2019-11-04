import React, { Component } from 'react';
import {
    Animated,Easing,
    AsyncStorage
} from "react-native";

import {
    createStackNavigator,
} from 'react-navigation';

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
import InsuranceListScreen from "./MHF0B011InsuranceListView"
import meclaimdetail from "./MHF0B012MeclaimDetailView"

import EmployeeList from "./MHF0B012EmployeeList"
import ChangePINScreen from "./ChangePINScreen"
import WelcomeScreen from "./WelcomeView"
import SharedPreference from "../SharedObject/SharedPreference"
// import SaveCompany from "./constants/SaveCompanylocation";

const AppNavigatorPin = createStackNavigator({
    
    PinScreen: { screen: pinScreen },
    RegisterScreen: { screen: registerScreen },
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
   
    calendarMonthView: { screen: calendarMonthView },
    calendarEventDetailView: { screen: calendarEventDetailView },
    ClockInOutSelfView: { screen: clockInOutSelfView },
    OTLineChartView: { screen: OTLineChartView },
    OTBarChartView: { screen: OTBarChartView },
    OrganizationOTStruct: { screen: OrganizationOTStruct },
    AnnouncementDetail: { screen: announcementdetail },
    ChangePINScreen: { screen: ChangePINScreen },
    EmployeeList: { screen: EmployeeList },
    WelcomeScreen: { screen: WelcomeScreen },
    InsuranceListScreen:{screen:InsuranceListScreen},
    meclaimdetail:{screen:meclaimdetail}
}, {
        initialRouteName: 'PinScreen',
        headerMode: 'none',
        navigationOptions: {
            gesturesEnabled: false,
        },
        transitionConfig: () => ({
            transitionSpec: {
                duration: 0,
                timing: Animated.timing,
                easing: Easing.step0,
                
            }
        })
    }
);

const AppNavigatorRegister = createStackNavigator({
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

    calendarMonthView: { screen: calendarMonthView },
    calendarEventDetailView: { screen: calendarEventDetailView },
    ClockInOutSelfView: { screen: clockInOutSelfView },
    OTLineChartView: { screen: OTLineChartView },
    OTBarChartView: { screen: OTBarChartView },
    OrganizationOTStruct: { screen: OrganizationOTStruct },
    AnnouncementDetail: { screen: announcementdetail },
    ChangePINScreen: { screen: ChangePINScreen },
    EmployeeList: { screen: EmployeeList },
    WelcomeScreen: { screen: WelcomeScreen },
    InsuranceListScreen:{screen:InsuranceListScreen},
    meclaimdetail:{screen:meclaimdetail}
    
}, {
        initialRouteName: 'RegisterScreen',
        headerMode: 'none',
        navigationOptions: {
            gesturesEnabled: false,
        },
        transitionConfig: () => ({
            transitionSpec: {
                duration: 0,
                timing: Animated.timing,
                easing: Easing.step0,
                
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
        console.log("NavigationController ==> componentWillMount")
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
        SharedPreference.profileObject = await this.saveProfile.getProfile()
        console.log("navigationController ==> ",SharedPreference.profileObject)
        if (SharedPreference.profileObject) {
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

    render() {
        console.log('app.je render',this.state.hasPin)
        if (this.state.hasPin == false) {
            if(SharedPreference.APPLICATION_DEVICE === 'STM'){
                //SharedPreference.company = 'stm'
                //SharedPreference.company = 'tmap-em'
            }else{
                SharedPreference.company = 'tmap-em'
            }
            
            return (
                <AppNavigatorRegister/>
            );
        } else {

            AsyncStorage.getItem("mycompany").then((value) => {

                if (value) {
                    
                    SharedPreference.company = value
                    
                }

            }).done();

            return (
                <AppNavigatorPin/>
            );
        }

    }
}