import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    ActivityIndicator,
    BackHandler,NetInfo
} from 'react-native';

import StringText from './../SharedObject/StringText'
import Decrypt from './../SharedObject/Decryptfun'

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"

import Months from "./../constants/Month"
import firebase from 'react-native-firebase';

import SharedPreference from "./../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"

export default class NonpayrollActivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            temparray: [],
           // dataSource: this.props.navigation.getParam("dataResponse", ""),
            selectYear: this.props.navigation.getParam("selectYear", new Date().getFullYear()),
            currentYearData: [],
            datalist: this.props.navigation.getParam("dataResponse", ""),
            badgeArray: this.props.navigation.getParam("badgeArray", []),
            lastYearData: []
        };
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_NON_PAYROLL_LIST)
        
        //console.log("badgeArray ==> ", this.state.badgeArray)

    }

    checkinternettype() {
        NetInfo.fetch().done(
            (networkType) => {
                this.setState({ networkType }, function () {
                    console.log("networkType ==> ", this.state.networkType)

                })
            }
        )
    }

    componentDidMount() {
        
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        this.settimerInAppNoti()
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);

    }

    // handleConnectivityChange = isConnected => {

    //     this.setState({ isConnected:isConnected });
    //    console.log(this.state.isConnected);
    // };
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

        this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))

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

        }

    }

    onAutenticateErrorAlertDialog() {

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
   
                    this.props.navigation.navigate('RegisterScreen')

                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog() {
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
   
                    this.props.navigation.navigate('RegisterScreen')

                }
            }],
            { cancelable: false }
        )
    }


    onBack() {

        this.props.navigation.navigate('HomeScreen');
    }



    renderRollItem() {
        year = 12
        monthRow = []
        monthContainer = []

        for (let index = 0; index < year; index++) {
            let month = index + 1
            let badge = 0
            for (let index = 0; index < this.state.badgeArray.length; index++) {
                const element = this.state.badgeArray[index];
                // //console.log("getBadgeCount ==> element ", element)
                // //console.log("getBadgeCount ==> year ", element.year, " , year ==> ", this.state.selectYear)
                if (element.year == this.state.selectYear) {
                    let data = element.detail.find((p) => {
                        return p.month === month
                    });
                    // //console.log("getBadgeCount ==>  data : ", data)
                    badge = data.badge
                }
            }

            // //console.log("element badge ==> ",badge)

            monthRow.push(
                this.customMonthContainer(month, this.checkAmount(this.state.selectYear, month), badge, index)
            )
            if (index % 3 === 2) {
                monthContainer.push(
                    <View style={{ flex: 1, flexDirection: 'row' }} key={index}>
                        {monthRow}
                    </View>)
                monthRow = []
            }
        }
        return monthContainer
    }

    checkAmount(selectYear, selectMonth) {
        if (this.state.datalist) {
            let dataArray = this.state.datalist.years;
            for (let index = 0; index < dataArray.length; index++) {
                const object = dataArray[index];
                if (object.year == selectYear) {
                    for (let k = 0; k < object.detail.length; k++) {
                        const element = object.detail
                        if (object.detail[k].month_no == selectMonth) {
                            // //console.log("month ==> ", object.detail.month, " , selectMonth : ", selectMonth)
                            return this.convertAmount(object.detail[k].sum_nonpay_amt)
                        }
                    }
                }
            }
            return false
        }

    }

    convertAmount(code) {
        //console.log("convertAmount ==> month ==> code ==> ", code)
        return Decrypt.decrypt(code);
    }

    customMonthContainer(monthNumber, amount, badge, index) {

        if (badge == null) {
            badge = 0
        }

        let currentYear = new Date().getFullYear()
        let currentMonth = new Date().getMonth() + 1

        if ((currentMonth == monthNumber) && (currentYear == this.state.selectYear)) {//currentMonth

            if (amount) {

                return (<View style={styles.nonPayRollitemBg} key={index}>
                    {/* <View style={styles.nonPayRollitemRed}> */}
                        <TouchableOpacity
                            style={styles.payslipitemlast}
                            disable={amount}
                            onPress={() => { this.onNonPayrollDetail(monthNumber) }} 
                            >
                            <View style={styles.nonPayRollDetailContainer}>
                                <Text style={[styles.payslipiteMonth, { color: 'white' }]}>{Months.monthNamesShort[monthNumber - 1]}</Text>
                            </View>
                            <View style={styles.nonPayRollDetailContainer}>
                                <Text style={[styles.payslipitemmoney, { color: 'white' }]}>{amount}</Text>
                            </View>
                            
                        </TouchableOpacity>
                    {/* </View> */}
                    {badge != 0 ?
                        <View style={styles.nonPayrollBadgeContrainer}>
                            <Text style={styles.nonPayrollBadgeText}>
                                {badge}
                            </Text>
                        </View>
                        : null}
                </View>)
            }
            amount = '0.00'
            return (<View style={styles.nonPayRollitemBg} key={index}>
                {/* <View style={[styles.nonPayRollitem, {
                    backgroundColor: Colors.calendarRedDotColor
                }]}> */}
                    <TouchableOpacity
                        style={[styles.nonPayRollitem, {backgroundColor: Colors.calendarRedDotColor}]}
                        disable={amount}
                        onPress={() => {
                            this.onLoadAlertDialog()
                        }}>
                        <View style={styles.nonPayRollDetailContainer}>
                            <Text style={[styles.payslipiteMonth, { color: 'white' }]}>{Months.monthNamesShort[monthNumber - 1]}</Text>
                        </View>
                        <View style={styles.nonPayRollDetailContainer}>
                            <Text style={[styles.payslipitemmoney, { color: 'white' }]}>{amount}</Text>
                        </View>
                      
                    </TouchableOpacity>
                {/* </View> */}
                {badge != 0 ?
                    <View style={styles.nonPayrollBadgeContrainer}>
                        <Text style={styles.nonPayrollBadgeText}>
                            {badge}
                        </Text>
                    </View>
                    : null}
            </View>
            )


        } else if ((monthNumber > currentMonth) && (currentYear == this.state.selectYear)) {//After currentMonth
            // nodata
            return (
                <View style={styles.nonPayRollitemBg} key={index}>
                    <View style={[styles.nonPayRollitem, {
                        backgroundColor: 'white',
                    }]} key={index}>
                    </View>
                </View>
                )

        } else if (amount) {//Normal Month - Has data 
            //console.log('amount :', amount)
            return (
                <View style={styles.nonPayRollitemBg} key={index}>
                    {/* <View style={styles.nonPayRollitem}> */}
                        <TouchableOpacity
                            style={styles.nonPayRollitem}
                            // onPress={() => {
                            //     //console.log("onPress ==> monthNumber ==> ", monthNumber, " , year ==> ", this.state.selectYear)
                            //     let badgeData = this.state.badgeArray
                            //     //console.log("onPress ==> badgeData1 ==> ", badgeData)
                            //     for (let index = 0; index < badgeData.length; index++) {
                            //         const element = badgeData[index];
                            //         if (element.year = this.state.selectYear) {
                            //             let data = element.detail.find((p) => {
                            //                 return p.month === monthNumber
                            //             });
                            //             data.badge = 0
                            //         }
                            //     }
                            //     //console.log("onPress ==> badgeData2 ==> ", badgeData)

                            //     this.props.navigation.navigate('NonPayrollDetail', {
                            //         month: monthNumber,
                            //         badgeData: badgeData,
                            //         selectYear: this.state.selectYear,
                            //         dataObject: this.state.dataSource
                            //     });
                            // }} 
                            
                            onPress={() => { this.onNonPayrollDetail(monthNumber) }} 
                            
                            >
                            <View style={styles.nonPayRollDetailContainer} >
                                <Text style={styles.payslipiteMonth}>{Months.monthNamesShort[monthNumber - 1]}</Text>
                            </View>
                            <View style={styles.nonPayRollDetailContainer}>
                                <Text style={styles.payslipitemmoney}>{amount}</Text>
                            </View>
                            
                        </TouchableOpacity>
                    {/* </View> */}
                    {badge != 0 ?
                        <View style={styles.nonPayrollBadgeContrainer}>
                            <Text style={styles.nonPayrollBadgeText}>
                                {badge}
                            </Text>
                        </View>
                        : null}
                </View>
            )


        } else {//
            return (//Normal Month - No data
                <View style={styles.nonPayRollitemBg} key={index}>
                {/* <View style={[styles.nonPayRollitem, {
                    backgroundColor: "white",
                }]} key={index}> */}
                    <TouchableOpacity
                        style={[styles.nonPayRollitem, {
                            backgroundColor: "white",
                        }]}
                        onPress={() => {
                            this.onLoadAlertDialog()
                        }}>
                        <View style={styles.nonPayRollDetailContainer}>
                            <Text style={styles.payslipiteMonth}>{Months.monthNamesShort[monthNumber - 1]}</Text>
                        </View>
                        <View style={styles.nonPayRollDetailContainer}>
                            <Text style={styles.payslipitemmoney}>0.00</Text>
                        </View>
                       
                    </TouchableOpacity>

                {/* </View> */}
                </View>
            )
        }
    }
    // onAutenticateErrorAlertDialog(error) {
    //     this.setState({
    //         isscreenloading: false,
    //     })

    //     Alert.alert(
    //         StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
    //         StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
    //         [{
    //             text: 'OK', onPress: () => {
    //                 page = 0
    //                 SharedPreference.Handbook = []
    //                 SharedPreference.profileObject = null
    //                 this.setState({
    //                     isscreenloading: false
    //                 })
    //                 this.props.navigation.navigate('RegisterScreen')
    //             }
    //         }],
    //         { cancelable: false }
    //     )

    //     //console.log("error : ", error)
    // }

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


    onDetail() {
        this.props.navigation.navigate('NonPayrollDetail');
    }

    onNonPayrollDetail(monthNumber) {
       
        if (SharedPreference.isConnected) {
            this.setState({
                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.getNonPayrollDetailfromAPI(monthNumber)

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

    getNonPayrollDetailfromAPI = async (monthNumber) => {
        // SharedPreference.NON_PAYROLL_DETAIL_API
        let data = await RestAPI(SharedPreference.NON_PAYROLL_DETAIL_API + monthNumber + "&year=" + this.state.selectYear, SharedPreference.FUNCTIONID_NON_PAYROLL)
       console.log('url : ',SharedPreference.NON_PAYROLL_DETAIL_API + monthNumber + "&year=" + this.state.selectYear, SharedPreference.FUNCTIONID_NON_PAYROLL)
        code = data[0]
        data = data[1]
        console.log("nonPayRollCallback data : ", data)
        if (code.SUCCESS == data.code) {
            //this.convertDateTime(data.data.detail[0].pay_date)
            this.setState({
                //dataSource: data.data,
                isLoading: false
            })
            //  this.getNonPayrollDetail()
            this.props.navigation.navigate('NonPayrollDetail', {
                // badgeData: badgeData,
                month: monthNumber,
               // dataSource:this.state.dataSource,
                selectYear: this.state.selectYear,
                dataObject: data.data,
                datalist:this.state.datalist
            })

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {
            
            this.onRegisterErrorAlertDialog()

        } else {

            this.setState({
                isscreenloading: false,
            })

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_TITLE,
                StringText.ALERT_CANNOT_CONNECT_DESC,
                [{ text: 'OK', onPress: () => { } },
                ], { cancelable: false }
            )

        }
    }

    onLastYear() {
        this.setState({
            selectYear: new Date().getFullYear() - 1
        })
    }

    onCurrentYear() {
        this.setState({
            selectYear: new Date().getFullYear()
        })
    }

    nonPayRollItem() {
        return (
            <View style={styles.nonPayRollItemContainer}>
                {this.renderRollItem}
            </View>
        )
    }

    renderTabYearSelect() {

        let lastYear = new Date().getFullYear() - 1
        
        return (
            <View style={styles.selectYearContainer}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={(this.onLastYear.bind(this))} >
                    <View style={this.state.selectYear === lastYear ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                        <Text style={this.state.selectYear === lastYear ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{lastYear}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={(this.onCurrentYear.bind(this))} >
                    <View style={this.state.selectYear === (lastYear + 1) ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                        <Text style={this.state.selectYear === (lastYear + 1) ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{lastYear + 1}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
            </View>)

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
            <View style={styles.container}>
                <View style={styles.navContainer}>
                    <TouchableOpacity style={styles.navLeftContainer} onPress={(this.onBack.bind(this))}>
                        <Image
                            style={styles.navBackButton}
                            source={require('../resource/images/Back.png')}
                        />
                    </TouchableOpacity>
                    <Text style={styles.navTitleText}>Non Payroll</Text>
                </View>

                <View style={styles.tabbarSelectYearContainer}>
                    {this.renderTabYearSelect()}
                </View>
                <View style={styles.nonPayRollMonthContainer}>
                    {this.renderRollItem()}
                </View>
                {this.renderloadingscreen()}
            </View >
        );
    }
}