import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    BackHandler, NetInfo,PanResponder
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"
// import { MonoText } from '../../components/StyledText';
// import  DataResponse  from "../../InAppData/Payslipdatalist"
import PayslipDataDetail from "./../InAppData/Payslipdatadetail2"
// import api from "../../constants/APIService"
import SharedPreference from "./../SharedObject/SharedPreference"
import Dcryptfun from "./../SharedObject/Decryptfun"
import Authorization from '../SharedObject/Authorization'
import StringText from '../SharedObject/StringText';
import Month from "../constants/Month"
import firebase from 'react-native-firebase';
import RestAPI from "../constants/RestAPI"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"

let monthlistdata = [];

let payslipItems = [];
let dataSource = [];

let initialyear = 0;

let temparray = [];
// let currentmonth = new Date().getMonth();
let monthdictionary = {};
let offine = 0;
let pay_date_str = 0;
//let indexselectyear = 0;
let tempdatadetail = []
let tempdatabody = []
let currentYear = new Date().getFullYear()

export default class PaySlipActivity extends Component {

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
            isscreenloading: false,
            loadingtype: 0,
            isFetching: false,
            expand: false,
            currentmonth: new Date().getMonth(),
            updatedHeight: 50,
            dataSource: 0,
            selectYearArray: [currentYear - 2, currentYear - 1, currentYear],
            indexselectyear: this.props.navigation.getParam("indexselectyear", ""),
            DataResponse: this.props.navigation.getParam("DataResponse", ""),
            yearlistdata: [],
            inappTimeIntervalStatus: true
        };

        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_PAYSLIP_LIST)

    }

    componentDidMount() {

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        // this.settimerInAppNoti()

        if (this.state.DataResponse) {
            this.state.yearlistdata = []
            dataSource = this.state.DataResponse;
            let yearnow = new Date().getFullYear();
            let monthnow = new Date().getMonth();

            for (let i = 0; i < this.state.selectYearArray.length; i++) {

                let havedatamonth = false;
                for (let j = 0; j < this.state.DataResponse.years.length; j++) {

                    if (this.state.DataResponse.years[j].year === this.state.selectYearArray[i]) {
                        havedatamonth = true;
                        // console.log('selectYearArray : ', this.state.selectYearArray[i], this.state.DataResponse.years[j].detail)
                        for (let k = 0; k < 12; k++) {

                            let rollID = 0;
                            let paydate = 0;
                            let netsalary = 0;
                            let badge = 0;

                            for (let l = 0; l < this.state.DataResponse.years[j].detail.length; l++) {

                                if (this.state.DataResponse.years[j].detail[l].month_no === k + 1) {

                                    rollID = this.state.DataResponse.years[j].detail[l].payroll_id;
                                    paydate = this.state.DataResponse.years[j].detail[l].pay_date
                                    netsalary = this.state.DataResponse.years[j].detail[l].net_salary
                                    for (let m = 0; m < SharedPreference.notiPayslipBadge.length; m++) {
                                        if (SharedPreference.notiPayslipBadge[m] == rollID) {
                                            badge = badge + 1;
                                        }
                                    }
                                }

                            }

                            this.state.yearlistdata.push({
                                rollID: rollID,
                                month: Month.monthNamesShort[k],
                                monthfull: Month.monthNames[k],
                                year: this.state.selectYearArray[i],
                                paydate: paydate,
                                netsalary: netsalary,
                                badge: badge
                            })

                        }
                        first = true;

                    }

                }
                if (!havedatamonth) {
                    for (let k = 0; k < 12; k++) {
                        let rollID = 0;
                        this.state.yearlistdata.push({
                            rollID: rollID,
                            month: Month.monthNamesShort[k],
                            monthfull: Month.monthNames[k],
                            year: this.state.selectYearArray[i],
                            badge: 0
                        })

                    }

                }
            }



            //    this.savedata()



            this.setState({

                isFetching: false,

                // loadingviewheight: 0,

            });


        }

        // this.createPayslipItem();
    }



    // //console.log(Layout.window.width);
    // this.fetchData()


    // }

    // async componentWillMount() {
    //     await this.getArrayOfYear()
    // }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);

    }

    // handleConnectivityChange = isConnected => {
    //     console.log('handleConnectivityChange isConnected',isConnected)
    //     this.setState({ isConnected });
    // };

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

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        console.log('payslip data', data)
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

            // let dataArray = data.data

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
        } else {

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


    getArrayOfYear() {

        let currentYear = new Date().getFullYear()

        for (let index = 2; index >= 0; index--) {

            this.state.selectYearArray.push(currentYear - index)
        }

        console.log("getArrayOfYear ==> selectYearArray : ", this.state.selectYearArray, currentYear)

    }

    onLoadAlertDialog() {
        // ////console.log("onLoadAlertDialog")
        Alert.alert(
            StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            StringText.ALERT_NONPAYROLL_NODATA_TITLE,
            [{
                text: StringText.ALERT_NONPAYROLL_NODATA_BUTTON, onPress: () => {
                    // ////console.log("onLoadAlertDialog")
                }
            },
            ],
            { cancelable: false }
        )
    }


    expand_collapse_Function = () => {

        if (this.state.expand == false) {

            this.setState({

                expand: true,
                updatedHeight: 250

            });

        }
        else {
            this.setState({

                expand: false,
                updatedHeight: 50

            });
        }
    }

    onBack() {
        // this.props.navigator.pop();
        SharedPreference.notiPayslipBadge = [];
        // this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
        this.props.navigation.goBack();
    }

    onCurrentYear() {

        // this.savedata()

        this.setState({
            indexselectyear: 2,
            expand: false,
            updatedHeight: 50,

        }, function () {

            // this.setState(this.createPayslipItem)
            // this.setState(this.PayslipItem())
        });

    }

    onLastYear() {

        //  this.savedata()

        this.setState({

            expand: false,
            updatedHeight: 50,
            indexselectyear: 1,

        }, function () {
            // this.setState(this.createPayslipItem)
            // this.setState(this.PayslipItem())
        });

    }

    onLast2Year() {

        //   this.savedata()

        this.setState({

            expand: false,
            updatedHeight: 50,
            indexselectyear: 0,

        }, function () {
            // this.setState(this.createPayslipItem)
            // this.setState(this.PayslipItem())
        });

    }

    // onRefresh() {

    //     this.setState({ isFetching: true }, function () { this.fetchData() });
    // }

    getPayslipDetailfromAPI = async (year, index) => {

        let rollid;

        if (dataSource.year) {



            for (let i = 0; i < dataSource.years.length; i++) {

                if (dataSource.years[i].year == year) {

                    for (let j = 0; j < dataSource.years[i].detail.length; j++) {

                        let realindex = index + 1;

                        if (dataSource.years[i].detail[j].month_no === realindex) {

                            rollid = dataSource.years[i].detail[j].payroll_id;

                            break
                        }

                    }

                }

            }
        }
        // for (let i = 0; i < yearlistdata[year].monthlistdata.length; i++) {

        //     if (yearlistdata[year].monthlistdata[i].month === index + 1) {
        //         rollid = yearlistdata[year].monthlistdata[i].id
        //     }
        // }
        console.log('rollid :', this.state.yearlistdata[(this.state.indexselectyear * 12) + index])
        let host = SharedPreference.PAYSLIP_DETAIL_API + 0
        if (this.state.yearlistdata[(this.state.indexselectyear * 12) + index]) {
            host = SharedPreference.PAYSLIP_DETAIL_API + this.state.yearlistdata[(this.state.indexselectyear * 12) + index].rollID
        }

        // console
        console.log('host :', host)

        //console.log('host : ', host);
        let FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)


        // //console.log('rollid', rollid)
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
                    console.log('status : ', this.state.dataSource);
                    if (this.state.dataSource.status === 200) {
                        //console.log('payslip detail DataResponse : ', this.state.dataSource, rollid);
                        // //console.log('DataResponse year : ',dataSource.data.years[year].year);
                        // this.setState(this.renderloadingscreen())
                        // this.props.navigation.navigate('PayslipDetail', {
                        //     // DataResponse:dataSource,
                        //     yearlist: this.state.yearlistdata,
                        //     initialyear: initialyear,
                        //     initialmonth: 0,
                        //     monthselected: index,
                        //     selectedindex: ((this.state.indexselectyear) * 12) + index,
                        //     yearselected: year,
                        //     Datadetail: this.state.dataSource,
                        //     rollid: rollid,

                        // });
                        // SharedPreference.notiPayslipBadge = [];
                        this.props.navigation.navigate('PayslipDetail', {
                            DataResponse: this.state.DataResponse,
                            yearlist: this.state.yearlistdata,
                            initialyear: initialyear,
                            initialmonth: 0,
                            monthselected: index,
                            selectedindex: ((this.state.indexselectyear) * 12) + index,
                            indexselectyear: this.state.indexselectyear,
                            Datadetail: this.state.dataSource,
                            rollid: rollid
                        });

                    } else if (this.state.dataSource.status == 401) {

                        this.onRegisterErrorAlertDialog()
                        // Alert.alert(
                        //     StringText.ALERT_SESSION_AUTHORIZED_TITILE,
                        //     StringText.ALERT_SESSION_AUTHORIZED_DESC,
                        //     [{
                        //         text: 'OK', onPress: () => {

                        //             SharedPreference.Handbook = []
                        //             SharedPreference.profileObject = null
                        //            // this.saveProfile.setProfile(null)
                        //             this.setState({
                        //                 isscreenloading: false
                        //             })
                        //             this.props.navigation.navigate('RegisterScreen')

                        //         }
                        //     }],
                        //     { cancelable: false }
                        // )
                    } else if (this.state.dataSource.status == 403) {

                        this.onAutenticateErrorAlertDialog()
                        // Alert.alert(
                        //     StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
                        //     StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
                        //     [{
                        //         text: 'OK', onPress: () => {

                        //             SharedPreference.Handbook = []
                        //             SharedPreference.profileObject = null
                        //            // this.saveProfile.setProfile(null)
                        //             this.setState({
                        //                 isscreenloading: false
                        //             })
                        //             this.props.navigation.navigate('RegisterScreen')

                        //         }
                        //     }],
                        //     { cancelable: false }
                        // )
                    } else {

                        Alert.alert(
                            this.state.dataSource.errors[0].code,
                            this.state.dataSource.errors[0].detail,
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

    PayslipDetail() {

        let exemption = '0';
        let income_acc = '0';
        let tax_acc = '0';
        let social_fund = '0';
        let emp_pf_year = '0';
        let com_pf_year = '0';


        // tempdatadetail = []
        // tempdatabody = []
        console.log('dataSource => ', dataSource.length)
        if (dataSource) {

            if (dataSource.years) {

                console.log('tempdatadetail => ', dataSource.years)
                console.log('indexselectyear => ', this.state.selectYearArray[this.state.indexselectyear])

                for (let i = 0; i < dataSource.years.length; i++) {
                    console.log('dataSource.years[i].year: => ', dataSource.years[i].year, this.state.selectYearArray[this.state.indexselectyear])
                    if (dataSource.years[i].year == this.state.selectYearArray[this.state.indexselectyear]) {

                        let ttempdatadetail = dataSource.years[i].header
                        // tempdatabody = dataSource.years[i].detail
                        console.log('dataSource.years : => ', ttempdatadetail)
                        exemption = Dcryptfun.decrypt(ttempdatadetail.exemption);
                        income_acc = Dcryptfun.decrypt(ttempdatadetail.income_acc);
                        tax_acc = Dcryptfun.decrypt(ttempdatadetail.tax_acc);
                        social_fund = Dcryptfun.decrypt(ttempdatadetail.social_fund);
                        emp_pf_year = Dcryptfun.decrypt(ttempdatadetail.emp_pf_year);
                        com_pf_year = Dcryptfun.decrypt(ttempdatadetail.com_pf_year);

                        // break
                    }

                }

            }

            // if (tempdatadetail.exemption) {

            //     exemption = Dcryptfun.decrypt(tempdatadetail.exemption);
            //     income_acc = Dcryptfun.decrypt(tempdatadetail.income_acc);
            //     tax_acc = Dcryptfun.decrypt(tempdatadetail.tax_acc);
            //     social_fund = Dcryptfun.decrypt(tempdatadetail.social_fund);
            //     emp_pf_year = Dcryptfun.decrypt(tempdatadetail.emp_pf_year);
            //     com_pf_year = Dcryptfun.decrypt(tempdatadetail.com_pf_year);

            // }

            return (

                <View style={{ height: this.state.updatedHeight, backgroundColor: 'gray', flexDirection: 'column', overflow: 'hidden', marginLeft: 5, marginRight: 5, borderRadius: 5 }}>
                    <View style={{ height: 49, width: '100%', backgroundColor: Colors.calendarLocationBoxColor, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >

                        <Text style={{ flex: 5, fontSize: 15, marginLeft: 10, fontWeight: 'bold' }}>ANNUAL</Text>
                        <TouchableOpacity style={{ flex: 1 }} onPress={(this.expand_collapse_Function.bind(this))}>
                            <Image
                                style={{ height: 80, width: 80 }}
                                source={this.state.expand === false ?
                                    require('./../resource/images/Expand.png') :
                                    require('./../resource/images/Collapse.png')}
                            // resizeMode='cover'
                            />
                        </TouchableOpacity>

                    </View>
                    <View style={{ height: 1, width: '100%', backgroundColor: 'gray' }} />
                    <View style={{ flex: 1, backgroundColor: Colors.calendarLocationBoxColor }}>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Exemption</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{exemption}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Year to date income</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{income_acc}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Year to date W/H Tax</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{tax_acc}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Social Security</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{social_fund}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Employee PVF</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{emp_pf_year}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.payslipAnnoualLeft}>Company PVF</Text>
                            <Text style={styles.payslipAnnoualRight} numberOfLines={1}>{com_pf_year}</Text>
                        </View>
                    </View>

                </View>

            )
        }
    }


    PayslipItem() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', marginLeft: 3, marginRight: 3 }}>
                {payslipItems}
            </View>

        )
    }
    PayslipBody() {

        let net1 = '0.00'; let pay1 = '-';
        let net2 = '0.00'; let pay2 = '-';
        let net3 = '0.00'; let pay3 = '-';
        let net4 = '0.00'; let pay4 = '-';
        let net5 = '0.00'; let pay5 = '-';
        let net6 = '0.00'; let pay6 = '-';
        let net7 = '0.00'; let pay7 = '-';
        let net8 = '0.00'; let pay8 = '-';
        let net9 = '0.00'; let pay9 = '-';
        let net10 = '0.00'; let pay10 = '-';
        let net11 = '0.00'; let pay11 = '-';
        let net12 = '0.00'; let pay12 = '-';
        let badge1 = 0;
        let badge2 = 0;
        let badge3 = 0;
        let badge4 = 0;
        let badge5 = 0;
        let badge6 = 0;
        let badge7 = 0;
        let badge8 = 0;
        let badge9 = 0;
        let badge10 = 0;
        let badge11 = 0;
        let badge12 = 0;
 
        if (this.state.yearlistdata.length) {
            console.log('yearlistdata =>', this.state.yearlistdata)
            console.log('indexselectyear =>', this.state.indexselectyear)
            // let netsalary =  this.state.yearlistdata[(this.state.yearselected * 12) + 5].netsalary
            // console.log('netsalary =>', netsalary)
            // console.log('client_secret =>', SharedPreference.profileObject.client_secret)
            // console.log('Dcryptfun =>', Dcryptfun.decrypt(netsalary))
            let tnet1 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 0].netsalary; let tpay1 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 0].paydate;
            if (tpay1) {
                let apay1 = tpay1.split('-'); pay1 = apay1[2] + ' ' + Month.monthNamesShort[apay1[1] - 1] + ' ' + apay1[0]; net1 = Dcryptfun.decrypt(tnet1);
                let anet1 = net1.split('.');
                // if (parseInt(anet1[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net1 = '0.00';
            }
            let tnet2 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 1].netsalary; let tpay2 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 1].paydate;
            if (tpay2) {
                let apay2 = tpay2.split('-'); pay2 = apay2[2] + ' ' + Month.monthNamesShort[apay2[1] - 1] + ' ' + apay2[0]; net2 = Dcryptfun.decrypt(tnet2);
                let anet2 = net2.split('.');
                // if (parseInt(anet2[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net2 = '0.00';
            }
            let tnet3 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 2].netsalary; let tpay3 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 2].paydate;
            if (tpay3) {
                let apay3 = tpay3.split('-'); pay3 = apay3[2] + ' ' + Month.monthNamesShort[apay3[1] - 1] + ' ' + apay3[0]; net3 = Dcryptfun.decrypt(tnet3);
                let anet3 = net3.split('.');
                // if (parseInt(anet3[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net3 = '0.00';
            }
            let tnet4 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 3].netsalary; let tpay4 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 3].paydate;
            if (tpay4) {
                let apay4 = tpay4.split('-'); pay4 = apay4[2] + ' ' + Month.monthNamesShort[apay4[1] - 1] + ' ' + apay4[0]; net4 = Dcryptfun.decrypt(tnet4);
                let anet4 = net4.split('.');
                // if (parseInt(anet4[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net4 = '0.00';
            }
            let tnet5 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 4].netsalary; let tpay5 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 4].paydate;
            if (tpay5) {
                let apay5 = tpay5.split('-'); pay5 = apay5[2] + ' ' + Month.monthNamesShort[apay5[1] - 1] + ' ' + apay5[0]; net5 = Dcryptfun.decrypt(tnet5);
                let anet5 = net5.split('.');
                // if (parseInt(anet5[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net5 = '0.00';
            }
            let tnet6 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 5].netsalary; let tpay6 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 5].paydate;
            if (tpay6) {
                let apay6 = tpay6.split('-'); pay6 = apay6[2] + ' ' + Month.monthNamesShort[apay6[1] - 1] + ' ' + apay6[0]; net6 = Dcryptfun.decrypt(tnet6);
                let anet6 = net6.split('.');
                // if (parseInt(anet6[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net6 = '0.00';
            }
            let tnet7 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 6].netsalary; let tpay7 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 6].paydate;
            if (tpay7) {
                let apay7 = tpay7.split('-'); pay7 = apay7[2] + ' ' + Month.monthNamesShort[apay7[1] - 1] + ' ' + apay7[0]; net7 = Dcryptfun.decrypt(tnet7);
                let anet7 = net7.split('.');
                // if (parseInt(anet7[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net7 = '0.00';
            }
            let tnet8 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 7].netsalary; let tpay8 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 7].paydate;
            if (tpay8) {
                let apay8 = tpay8.split('-'); pay8 = apay8[2] + ' ' + Month.monthNamesShort[apay8[1] - 1] + ' ' + apay8[0]; net8 = Dcryptfun.decrypt(tnet8);
                let anet8 = net8.split('.');
                // if (parseInt(anet8[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net8 = '0.00';
            }
            let tnet9 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 8].netsalary; let tpay9 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 8].paydate;
            if (tpay9) {
                let apay9 = tpay9.split('-'); pay9 = apay9[2] + ' ' + Month.monthNamesShort[apay9[1] - 1] + ' ' + apay9[0]; net9 = Dcryptfun.decrypt(tnet9);
                let anet9 = net9.split('.');
                // if (parseInt(anet9[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net9 = '0.00';
            }
            let tnet10 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 9].netsalary; let tpay10 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 9].paydate;
            if (tpay10) {
                let apay10 = tpay10.split('-'); pay10 = apay10[2] + ' ' + Month.monthNamesShort[apay10[1] - 1] + ' ' + apay10[0]; net10 = Dcryptfun.decrypt(tnet10);
                let anet10 = net10.split('.');
                // if (parseInt(anet10[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net10 = '0.00';
            }
            let tnet11 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 10].netsalary; let tpay11 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 10].paydate;
            if (tpay11) {
                let apay11 = tpay11.split('-'); pay11 = apay11[2] + ' ' + Month.monthNamesShort[apay11[1] - 1] + ' ' + apay11[0]; net11 = Dcryptfun.decrypt(tnet11);
                let anet11 = net11.split('.');
                // if (parseInt(anet11[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net11 = '0.00';
            }
            let tnet12 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 11].netsalary; let tpay12 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 11].paydate;
            if (tpay12) {
                let apay12 = tpay12.split('-'); pay12 = apay12[2] + ' ' + Month.monthNamesShort[apay12[1] - 1] + ' ' + apay12[0]; net12 = Dcryptfun.decrypt(tnet12);
                let anet12 = net12.split('.');
                // if (parseInt(anet12[0].replace(',', '').replace(',', '').replace(',', '')) < 0) net12 = '0.00';
            }

        
            badge1 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 0].badge;
            badge2 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 1].badge;
            badge3 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 2].badge;
            badge4 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 3].badge;
            badge5 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 4].badge;
            badge6 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 5].badge;
            badge7 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 6].badge;
            badge8 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 7].badge;
            badge9 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 8].badge;
            badge10 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 9].badge;
            badge11 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 10].badge;
            badge12 = this.state.yearlistdata[(this.state.indexselectyear * 12) + 11].badge;
        }
        return (
            <View style={{ flex: 1, margin: 3, }}>

                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={0 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay1 == '-' ? styles.payslipitemdisable :
                                    0 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay1 == '-'}
                                onPress={() => { this.onPayslipDetail(0, net1) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={0 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : styles.payslipiteMonth}>{Month.monthNamesShort[0]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={0 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 0 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net1}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={0 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 0 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay1}</Text></View>
                            </TouchableOpacity>
                            <View style={badge1 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge1 ? { color: 'white' } : { color: 'transparent' }}>{badge1}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={1 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                1 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                pay2 == '-'? styles.payslipitemdisable :
                                    styles.payslipitem}
                                disabled={pay2 == '-'}
                                onPress={() => { this.onPayslipDetail(1, net2) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={1 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 1 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[1]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={1 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 1 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net2}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={1 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 1 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay2}</Text></View>
                            </TouchableOpacity>
                            <View style={badge2 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge2 ? { color: 'white' } : { color: 'transparent' }}>{badge2}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={2 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay3 == '-' ? styles.payslipitemdisable :
                                    2 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay3 == '-'}
                                onPress={() => { this.onPayslipDetail(2, net3) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={2 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 2 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[2]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={2 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 2 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net3}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={2 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 2 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay3}</Text></View>
                            </TouchableOpacity>
                            <View style={badge3 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge3 ? { color: 'white' } : { color: 'transparent' }}>{badge3}</Text></View>
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={3 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay4 == '-'? styles.payslipitemdisable :
                                    3 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay4 == '-'}
                                onPress={() => { this.onPayslipDetail(3, net4) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={3 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 3 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[3]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={3 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 3 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net4}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={3 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 3 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay4}</Text></View>

                            </TouchableOpacity>
                            <View style={badge4 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge4 ? { color: 'white' } : { color: 'transparent' }}>{badge4}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={4 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay5 == '-' ? styles.payslipitemdisable :
                                    4 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay5 == '-'}
                                onPress={() => { this.onPayslipDetail(4, net5) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={4 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 4 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[4]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={4 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 4 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net5}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={4 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 4 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay5}</Text></View>
                            </TouchableOpacity>
                            <View style={badge5 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge5 ? { color: 'white' } : { color: 'transparent' }}>{badge5}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={5 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay6 == '-' ? styles.payslipitemdisable :
                                    5 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay6 == '-'}
                                onPress={() => { this.onPayslipDetail(5, net6) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={5 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 5 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[5]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={5 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 5 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net6}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={5 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 5 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay6}</Text></View>

                            </TouchableOpacity>
                            <View style={badge6 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge6 ? { color: 'white' } : { color: 'transparent' }}>{badge6}</Text></View>
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={6 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay7 == '-' ? styles.payslipitemdisable :
                                    6 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay7 == '-'}
                                onPress={() => { this.onPayslipDetail(6, net7) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={6 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 6 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[6]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={6 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 6 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net7}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={6 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 6 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay7}</Text></View>
                            </TouchableOpacity>
                            <View style={badge7 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge7 ? { color: 'white' } : { color: 'transparent' }}>{badge7}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={7 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay8 == '-' ? styles.payslipitemdisable :
                                    7 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay8 == '-'}
                                onPress={() => { this.onPayslipDetail(7, net8) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={7 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 7 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[7]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={7 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 7 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net8}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={7 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 7 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay8}</Text></View>
                            </TouchableOpacity>
                            <View style={badge8 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge8 ? { color: 'white' } : { color: 'transparent' }}>{badge8}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={8 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay9 == '-' ? styles.payslipitemdisable :
                                    8 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay9 == '-'}
                                onPress={() => { this.onPayslipDetail(8, net9) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={8 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 8 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[8]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={8 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 8 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net9}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={8 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 8 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay9}</Text></View>

                            </TouchableOpacity>
                            <View style={badge9 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge9 ? { color: 'white' } : { color: 'transparent' }}>{badge9}</Text></View>
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={9 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay10 == '-' ? styles.payslipitemdisable :
                                    9 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                        styles.payslipitem}
                                disabled={pay10 == '-'}
                                onPress={() => { this.onPayslipDetail(9, net10) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={9 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 9 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[9]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={9 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 9 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net10}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={9 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 9 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay10}</Text></View>
                            </TouchableOpacity>
                            <View style={badge10 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge10 ? { color: 'white' } : { color: 'transparent' }}>{badge10}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={10 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay11 == '-' ? styles.payslipitemdisable :
                                    10 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                    styles.payslipitem}
                                disabled={pay11 == '-'}
                                onPress={() => { this.onPayslipDetail(10, net11) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={10 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 10 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[10]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={10 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 10 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net11}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={10 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 10 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay11}</Text></View>
                            </TouchableOpacity>
                            <View style={badge11 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge11 ? { color: 'white' } : { color: 'transparent' }}>{badge11}</Text></View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={11 === this.state.currentmonth && this.state.indexselectyear === 2 ?
                                styles.payslipitemlast :
                                pay12 == '-' ? styles.payslipitemdisable :
                                    11 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdisable :
                                    styles.payslipitem}
                                disabled={pay12 == '-'}
                                onPress={() => { this.onPayslipDetail(11, net12) }} >
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={11 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdMonth : 11 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipiteMonthHide : styles.payslipiteMonth}>{Month.monthNamesShort[11]}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={11 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdNet : 11 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemmoney}>{net12}</Text></View>
                                <View style={{ flex: 1, justifyContent: 'center' }}><Text style={11 === this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemcurrentdetail : 11 > this.state.currentmonth && this.state.indexselectyear === 2 ? styles.payslipitemdetailHide : styles.payslipitemdate}>{pay12}</Text></View>
                            </TouchableOpacity>
                            <View style={badge12 ? styles.badgeIconpayslip : styles.badgeIconpayslipDisable}><Text style={badge12 ? { color: 'white' } : { color: 'transparent' }}>{badge12}</Text></View>
                        </View>
                    </View>
                </View>
            </View>

        )
    }

    onPayslipDetail(index, data) {

        if (index > this.state.currentmonth && this.state.indexselectyear === 2) {
            return
            // } else if (data === '0.00') {
            //     return
            // Alert.alert(
            //     'No Data',
            //     'No Data',
            //     [{text: StringText.ALERT_NONPAYROLL_NODATA_BUTTON, onPress: () => {}},
            //     ],{ cancelable: false }
            // )

        } else {
            console.log('isConnected => ', this.state.isConnected)
            if (SharedPreference.isConnected) {

                this.setState({

                    isscreenloading: true,
                    loadingtype: 3

                }, function () {

                    this.getPayslipDetailfromAPI(this.state.selectYearArray[this.state.indexselectyear], index)

                });
            } else {

                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                    [{ text: 'OK', onPress: () => { } },
                    ], { cancelable: false }
                )

            }

        }


    }

    renderloadingscreen() {

        if (this.state.isscreenloading) {

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
            <View style={{ flex: 1 }} 
            collapsable={true}
            {...this.panResponder.panHandlers}
            >
                <View style={[styles.navContainer, { flexDirection: 'column' }]}>
                    <View style={styles.statusbarcontainer} />
                    <View style={{ height: 50, flexDirection: 'row', }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <TouchableOpacity onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.navTitleTextTop}>Pay Slip</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={styles.leavequotaTabbar}>

                    <View style={{ flex: 1, flexDirection: 'column', marginTop: 7, marginLeft: 7, marginRight: 7 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={(this.onLast2Year.bind(this)

                                )}>
                                <View style={this.state.indexselectyear === 0 ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                                    <Text style={this.state.indexselectyear === 0 ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{this.state.selectYearArray[0]}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={(this.onLastYear.bind(this))}
                            >
                                <View style={this.state.indexselectyear === 1 ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                                    <Text style={this.state.indexselectyear === 1 ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{this.state.selectYearArray[1]}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={(this.onCurrentYear.bind(this))}>
                                <View style={this.state.indexselectyear === 2 ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                                    <Text style={this.state.indexselectyear === 2 ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{this.state.selectYearArray[2]}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ flex: 1, backgroundColor: Colors.backgroundcolor }} />
                        </View>
                        {/* <View style={{ height: 10,backgroundColor:Colors.calendarLocationBoxColor }}/> */}
                    </View>

                </View>

                <View style={{ flex: 1, backgroundColor: Colors.backgroundcolor, flexDirection: 'column' }}>

                    {this.PayslipDetail()}
                    {this.PayslipBody()}

                </View>
                {this.renderloadingscreen()}
            </View >
        );
    }
}