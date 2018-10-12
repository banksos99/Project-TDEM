import React, { Component } from 'react';

import {
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    BackHandler,
    PanResponder
} from 'react-native';

import { styles } from "./../SharedObject/MainStyles"

import SharedPreference from './../SharedObject/SharedPreference'
import RestAPI from "../constants/RestAPI"

// import customData from './../InAppData/non-payroll-detail-data.json';
import Decrypt from './../SharedObject/Decryptfun'
import StringText from './../SharedObject/StringText'
import moment from 'moment'
import firebase from 'react-native-firebase';
import Month from '../constants/Month';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"

export default class NonpayrollDetailView extends Component {

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

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
           
            isLoading: false,
            dataObject: this.props.navigation.getParam("dataObject", ""),
            datalist: this.props.navigation.getParam("datalist", ""),
            selectYear: this.props.navigation.getParam("selectYear", ""),
            selectMonth: this.props.navigation.getParam("month", ""),
            badgeData: this.props.navigation.getParam("badgeData", {}),
            DataResponse: this.props.navigation.getParam("DataResponse", {}),
            indexselectyear: this.props.navigation.getParam("indexselectyear", {}),
    
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_NON_PAYROLL_DETAIL)
        this.state.monthYear=Month.monthNames[this.state.selectMonth-1]+' '+this.state.selectYear

    }

    componentDidMount() {

        
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // this.settimerInAppNoti()
    }

    // componentWillMount() {
    //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    // }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearTimeout(this.timer);
    }

    handleBackButtonClick() {
        
        this.onBack()
        return true;
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

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval, 1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        code = data[0]
        data = data[1]

        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.SUCCESS == data.code) {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);
            
            // let dataArray = data.data;
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

    onAutenticateErrorAlertDialog() {
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


    convertDateTime(date) {
        const format = 'MMMM YYYY'
        const selectedDateMonth = moment(date).format(format);
        this.setState({
            monthYear: selectedDateMonth
        })
    }

    getNonPayrollDetail() {
        try {
            const format = 'DD/MM/YYYY'
            detail = []

            let array = this.state.dataObject.detail
            let keyindex = 0;
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                // //////console.log("getNonPayrollDetail ==> element : ", element.pay_date)
                const items = element.items;
                const datetime = moment(element.pay_date).format(format);
                detail.push(this.renderDate(datetime))
                subDetail = []

                for (let index2 = 0; index2 < items.length; index2++) {
                    const item = items[index2];
                    const detail = item.tran_detail;
                    const money = item.nonpay_amt
                    var decodedString = Decrypt.decrypt(money)
                    subDetail.push(this.renderSection(detail, decodedString,keyindex))
                }
                detail.push(subDetail);
                detail.push(<View style={{ height: 1, backgroundColor: 'gray', marginLeft: 20, marginRight: 20 }} key={keyindex}></View>

                );
                keyindex = keyindex + 1;
            }

            return detail
        } catch (error) {
            ////////console.log('getNonPayrollDetail ==> error :', error);
        }
    }
    // return Decrypt.decrypt(code);
    // decrypt(code) {
    //     return Decrypt.decrypt(code);
    // }

    renderDate(date) {
        return (
            <Text style={styles.nonPayRollTitleText} key={date}>{date}</Text>
        );
    }

    renderSection(detail, money,index) {
        return (
            <View style={{marginLeft:20,marginRight:20}} key={100+index}>
                <View style={styles.nonPayRollLeftContainer}>
                    <Text style={styles.nonPayRolldateDetailText}>{detail}</Text>
                </View>
                <View style={styles.nonPayRollRightContainer}>
                    <Text style={styles.nonPayRolldateMoneyText}>{money}</Text>
                </View>
            </View >
        );
    }

    onBack() {

        // this.props.navigation.navigate('NonPayrollList', {
        //     dataResponse: this.state.datalist,
        // })
        // console.log()
        //         this.props.navigation.navigate('NonPayrollList', {
        //             DataResponse:this.state.DataResponse,
        //             dataResponse: this.state.datalist,
        //             selectYear: this.state.selectYear,
        //             badgeData: this.state.badgeData,
        //             indexselectyear:this.state.indexselectyear
        //         });
    
        this.props.navigation.goBack();

    }


    renderProgressView() {
        if (this.state.isLoading) {
            return (
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>

                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <ActivityIndicator />
                    </View>
                </View>
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
                        <TouchableOpacity style={styles.navLeftContainer}
                            onPress={(this.onBack.bind(this))}
                        >
                            <Image
                                style={styles.navBackButton}
                                source={require('../resource/images/Back.png')}
                            />
                        </TouchableOpacity>
                        <Text style={styles.navTitleText}>Non-Payroll Detail</Text>
                    </View>
                    <Text style={styles.nonPayRolldateYearText}>{this.state.monthYear}</Text>
                    <View style={{ height: 1, backgroundColor: 'gray',marginLeft: 20, marginRight: 20 }}></View>
                    <ScrollView style={{ flex:1 }}>

                        {this.getNonPayrollDetail()}
                    </ScrollView>

                </View >

                {this.renderProgressView()}
            </View>
        );
    }
}

