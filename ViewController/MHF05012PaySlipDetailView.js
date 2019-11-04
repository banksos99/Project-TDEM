import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'


import {
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    Alert,
    BackHandler,
    NetInfo,
    PanResponder
} from 'react-native';

import firebase from 'react-native-firebase';
import FileProvider from 'react-native-file-provider';
import { DocumentDirectoryPath } from 'react-native-fs';

import Colors from "../SharedObject/Colors"
import Layout from "../SharedObject/Layout"
import { styles } from "../SharedObject/MainStyles"
import SharedPreference from "../SharedObject/SharedPreference"
import Decryptfun from "../SharedObject/Decryptfun"
import Authorization from '../SharedObject/Authorization'
import StringText from '../SharedObject/StringText'

import Months from "../constants/Month"
import RestAPI from "../constants/RestAPI"
import PayslipPDFApi from "../constants/PayslipPDFApi"
import LoginChangePinAPI from "../constants/LoginChangePinAPI"





let currentmonth = new Date().getMonth();
let scale = Layout.window.width / 320;
let netincomestr='';
let taincome;
let PAYSLIP_DOWNLOAD_API;

export default class PayslipDetail extends Component {

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
            url: '',
            showincome: true,
            Heightincome: 0,
            heightdeduct: 0,
            incomeBG: Colors.greenTextColor,
            incomeText: 'white',
            deductBG: Colors.pink,
            deductText: Colors.lightred,
            bordercolor: Colors.greenTextColor,

            initialyear: this.props.navigation.getParam("initialyear", ""),
            initmonth: this.props.navigation.getParam("initialmonth", ""),
            yearlist: this.props.navigation.getParam("yearlist", ""),
            monthselected: this.props.navigation.getParam("monthselected", ""),
            yearselected: this.props.navigation.getParam("yearselected", ""),
            datadetail: this.props.navigation.getParam("Datadetail", ""),
            rollid: this.props.navigation.getParam("rollid", ""),
            havePermission: false,
            yearArray: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            selectedindex:this.props.navigation.getParam("selectedindex", ""),
            DataResponse: this.props.navigation.getParam("DataResponse", ""),
            indexselectyear: this.props.navigation.getParam("indexselectyear", ""),
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_PAYSLIP_DETAIL)
     
    }

    componentDidMount() {

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    
    }
 
    componentWillUnmount() {
       
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
   
        clearTimeout(this.timer);

    }

    // settimerInAppNoti() {
    //     this.timer = setTimeout(() => {
    //         this.onLoadInAppNoti()
    //     }, SharedPreference.timeinterval);

    // }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    onBack() {

        SharedPreference.notipayslipID = 0
 
        if (this.state.yearlist) {
            this.props.navigation.navigate('PayslipList', {
                DataResponse: this.state.DataResponse,
                indexselectyear:this.state.indexselectyear
            })
        } else {

            this.props.navigation.goBack();
        }

    }
    // onLoadInAppNoti = async () => {
        
    //     this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))

    // }

    // APIInAppCallback(data) {
    //     code = data[0]
    //     data = data[1]

    //     if (code.INVALID_AUTH_TOKEN == data.code) {

    //         this.onAutenticateErrorAlertDialog()

    //     } else if (code.DOES_NOT_EXISTS == data.code) {

    //         this.onRegisterErrorAlertDialog(data)

    //     } else if (code.SUCCESS == data.code) {

    //         this.timer = setTimeout(() => {
    //             this.onLoadInAppNoti()
    //         }, SharedPreference.timeinterval);

    //     }else{

    //         this.timer = setTimeout(() => {
    //             this.onLoadInAppNoti()
    //         }, SharedPreference.timeinterval);
            

    //     }

    // }

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

    onClickDownload() {
        this.onDownloadPDFFile()

    }

    requestPDFPermission = async () => {

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    'title': "Permission",
                    'message': 'External Storage Permission'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                this.setState({
                    havePermission: true
                })
                this.onDownloadPDFFile()
            } else {
                this.onDownloadPDFFile()

            }
        } catch (err) {
            console.warn(err)
        }
    }

    onDownloadPDFFile = async () => {
        if (SharedPreference.isConnected) {

            this.setState({

                isscreenloading: true,

            }, function () {

            });

            this.checkDownloadStatus()

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

    checkDownloadStatus = async () => {
        //PAYSLIP_DOWNLOAD_API = SharedPreference.PAYSLIP_DOWNLOAD_API + this.state.yearlist[this.state.selectedindex].rollID
        let url;

        if (this.state.yearlist) {

            PAYSLIP_DOWNLOAD_API = SharedPreference.PAYSLIP_DOWNLOAD_API + this.state.yearlist[this.state.selectedindex].rollID
            url = this.state.yearlist[this.state.selectedindex].rollID

        } else {

            PAYSLIP_DOWNLOAD_API = SharedPreference.PAYSLIP_DOWNLOAD_API + this.state.datadetail.data.payroll_id
            url = this.state.datadetail.data.payroll_id

        }

        let pdfPath = PAYSLIP_DOWNLOAD_API

        let filename;
        if (this.state.yearlist) {

            filename = "Payslip_" + this.state.yearArray[this.state.monthselected] + "_" + this.state.yearlist[this.state.selectedindex].year + '.pdf'

        } else {

            let temp = this.state.datadetail.data.header.pay_date.split('-')
            filename = "Payslip_" + Months.monthNames[parseInt(temp[1]) - 1] + ' _' + temp[0] + '.pdf'
        }

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)

        let savePath = DocumentDirectoryPath + '/pdf/' + filename;
        //let savePath = RNFetchBlob.fs.dirs.DownloadDir + '/' + filename;

        console.log("FUNCTIONID_PAYSLIP ==> path  : ", savePath)
       
        
        if (Platform.OS === 'android') {
            RNFetchBlob
                .config({
                    path: savePath,
                    title: filename,

                })
                .fetch('GET', PAYSLIP_DOWNLOAD_API, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                    console.log('esp.status :', resp.respInfo.status)
                    
                    if (resp.respInfo.status == 200) {
                        this.setState({

                            isscreenloading: false,

                        }, function () {
                            // this.setState(this.renderloadingscreen())
                        });
                        RNFetchBlob.android.actionViewIntent(resp.path(), 'application/pdf');

                    } else {

                        Alert.alert(
                            StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                            StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.setState({

                                            isscreenloading: false,

                                        });
                                    }
                                },
                            ],
                            { cancelable: false }
                        )
                    }

                })
                .catch((errorCode, errorMessage) => {

                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [

                            {
                                text: 'OK', onPress: () => {
                                    this.setState({
                                        isscreenloading: false
                                    })
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                })
        } else {//iOS

            RNFetchBlob
                .config({
                    fileCache: true,
                    appendExt: 'pdf',
                    filename: filename
                })
                .fetch('GET', PAYSLIP_DOWNLOAD_API, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {

                    RNFetchBlob.fs.exists(resp.path())
                        .then((exist) => {
                            // console.log(`WorkingCalendarYear ==> file ${exist ? '' : 'not'} exists`)
                        })
                        .catch(() => {
                            // console.log('WorkingCalendarYear ==> err while checking')
                        });

                    if (resp.respInfo.status == 200) {



                        this.setState({

                            isscreenloading: false,

                        }, function () {
                            // this.setState(this.renderloadingscreen())
                            RNFetchBlob.ios.openDocument(resp.path());
                        });



                    } else {

                        Alert.alert(
                            StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                            StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.setState({

                                            isscreenloading: false,

                                        });
                                    }
                                },
                            ],
                            { cancelable: false }
                        )

                    }

                    this.setState({

                        isscreenloading: false,

                    }, function () {
                        // this.setState(this.renderloadingscreen())
                    });

                })
                .catch((errorMessage, statusCode) => {
                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [
                            {
                                text: 'OK', onPress: () => {
                                    this.setState({

                                        isscreenloading: false,

                                    });
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                });
        }

    }

    

    getPayslipDetailfromAPI = async () => {

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)

        let host;

        if(this.state.yearlist){
             host = SharedPreference.PAYSLIP_DETAIL_API + this.state.yearlist[this.state.selectedindex].rollID
        }else{
             host = SharedPreference.PAYSLIP_DETAIL_API + this.state.datadetail.data.payroll_id
        }

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

                if (responseJson.status == 403) {

                    this.onAutenticateErrorAlertDialog()

                } else if (parseInt(responseJson.status) == 401) {

                    this.onRegisterErrorAlertDialog()

                } else if (responseJson.status == 200) {

                    this.setState({

                        isscreenloading: false,
                        datadetail: responseJson
 
                    }, function () {
                        this.setState(this.renderloadingscreen())
                    }

                    );
                } else {
                    this.setState({

                        isscreenloading: false,
                        datadetail:[]

                    }, function () {

                      
                    });
            
                   

                }

            })
            .catch((error) => {
                console.error(error);
            });
       
    }

    onShowIncomeView() {

        this.setState({
            showincome: true,
            incomeBG: Colors.greenTextColor,
            incomeText: 'white',
            deductBG: Colors.pink,
            deductText: Colors.lightred,
            bordercolor: Colors.greenTextColor,
        });
    }

    onShowDeductView() {

        this.setState({
            showincome: false,
            incomeBG: Colors.burlywood,
            incomeText: Colors.greenTextColor,
            deductBG: Colors.lightred,
            deductText: 'white',
            bordercolor: Colors.redTextColor,
        });
    }

    nextmonth() {

        if (SharedPreference.isConnected) {

            this.setState({

                selectedindex: this.state.selectedindex + 1

            }, function () {

                this.onChangeMonth()
            });

        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => {
                    this.setState({
                        isscreenloading: false
                    })
                 } },
                ], { cancelable: false }
            )

        }

    }

    previousmonth() {

        if (SharedPreference.isConnected) {

            this.setState({

                selectedindex: this.state.selectedindex - 1

            }, function () {

                console.log('selectedindex : ', this.state.selectedindex);

                this.onChangeMonth()
            });
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => {
                    this.setState({
                        isscreenloading: false
                    })
                 } },
                ], { cancelable: false }
            )
        }

    }

    onChangeMonth() {

      //  if (this.state.yearlist[this.state.selectedindex].rollID) {

            this.setState({

                isscreenloading: true,
                loadingtype: 3

            }, function () {

                this.getPayslipDetailfromAPI()

            });

        // } else {
        //     this.setState({

        //         isscreenloading: false,
        //         datadetail: '',

        //     }, function () {

        //     });

        // }

    }

    nextmonthbuttonrender() {
        console.log("yearselected",this.state.yearselected)
        console.log("monthselected",this.state.monthselected)
        console.log("selectedindex",this.state.selectedindex)
        console.log("currentmonth",new Date().getMonth())

        if (this.state.yearlist.length <= this.state.selectedindex + 1 | !this.state.yearlist ) {
            return (
                <View style={{ flex: 1 ,justifyContent: 'center'}}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/next_dis.png')}
                        resizeMode='contain'
                    />
                </View>
            )

        }
        // else if ((this.state.selectedindex - 24) === new Date().getMonth()) {
        //     return (
        //         <View style={{ flex: 1, justifyContent: 'center' }}>
        //             <Image
        //                 style={{ width: 45, height: 45 }}
        //                 source={require('./../resource/images/next_dis.png')}
        //                 resizeMode='contain'
        //             />
        //         </View>
        //     )
        // }

        return (
            <View style={{ flex: 1 ,justifyContent: 'center'}}>
                <TouchableOpacity onPress={(this.nextmonth.bind(this))}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/next.png')}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>
        )
    }

    previousbuttonrender() {

        if (0 == this.state.selectedindex | !this.state.yearlist) {

            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/previous_dis.png')}
                    />
                </View>
            )

        }

        return (
            <View style={{ flex: 1,justifyContent:'center' }}>
                <TouchableOpacity onPress={(this.previousmonth.bind(this))}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/previous.png')}
                    // resizeMode='center'
                    />
                </TouchableOpacity>
            </View>
        )
    }

    renderdetail() {

        if (this.state.datadetail) {

            if (this.state.showincome) {

                return (
                    <View style={{ flex: 5, }}>
                        <View style={{ flex: 1, marginBottom: 15,  borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                            <View style={{ height: 10, justifyContent: 'center' }}>
                                {/* <Text style={styles.payslipTitleTextLeft}>INCOME</Text> */}
                            </View>
                            {this.renderdeatilincome()}
                        </View>
                    </View>
                )
            }
            return (
                <View style={{ flex: 5, }}>
                    <View style={{ flex: 1,  marginBottom: 15,  borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                        {<View style={{ height: 10, width: '100%', justifyContent: 'center', }}>
                            {/* <Text style={styles.payslipTitleTextLeft}>DEDUCT</Text> */}
                        </View>}
                        {this.renderdetaildeduct()}
                    </View>
                </View>

            )
        } else {
            if (this.state.showincome) {

                return (
                    <View style={{ flex: 5, }}>
                        <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                            <View style={{ height: 50, justifyContent: 'center' }}>
                                <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>INCOME</Text>
                            </View>
                            <View style={{  flexDirection: 'column', justifyContent: 'center' }}>
                                <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
                            </View>
                        </View>
                    </View>

                )

            }
            return (
                <View style={{ flex: 5, }}>
                    <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                        {<View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>DEDUCT</Text>
                        </View>}
                        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                            <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
                        </View>
                    </View>
                </View>

            )
        }

    }

    renderdeatilincome() {

        if (this.state.datadetail.data) {

            if (this.state.datadetail.data.detail.income.length) {

                return (
                    <View style={{ flex: 1 }} >
                        <ScrollView style={{ flex: 1 }}>
                            {
                                this.state.datadetail.data.detail.income.map((item, index) => (
                                    <View style={{ flex: 1, flexDirection: 'row' }} key={index}>
                                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>
                                                {item.key}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1.3, justifyContent: 'flex-start' }}>
                                            <Text style={styles.payslipDetailTextRight}allowFontScaling={SharedPreference.allowfontscale}>
                                                {(Decryptfun.decrypt(item.value))}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </ScrollView>
                    </View>
                )
            }
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
            </View>
        );

    }

    renderdetaildeduct() {

        if (this.state.datadetail.data) {

            if (this.state.datadetail.data.detail.deduct.length) {
                return (
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            {
                                this.state.datadetail.data.detail.deduct.map((item, index) => (
                                    <View style={{ flex: 1, flexDirection: 'row' }} key={index}>
                                        <View style={{ flex: 2, justifyContent: 'flex-start', }}>
                                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>{item.key}</Text>
                                        </View>
                                        <View style={{ flex: 1.3, justifyContent: 'flex-start', }}>
                                            <Text style={styles.payslipDetailTextRight}allowFontScaling={SharedPreference.allowfontscale}>
                                                {(Decryptfun.decrypt(item.value))}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </ScrollView>
                    </View>

                )

            }
        }
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
            </View>
        );
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

        let income = 0;
        let deduct = 0;
        // let deduct = parseInt(this.state.datadetail.data.header.sum_deduct.replace(',',''));
        let netincome = 0;

        let pay_date_str = '';
        let bank_name_str = '';
        let bank_acc_str = '';
        let sum_income_str = 0;
        let sum_deduct_str = 0;
        let bankicon = require('./../resource/images/bankIcon/blank.png')
        let date_text = '';
        let download = false;
        netincomestr = '0.00'
        if (this.state.datadetail.data) {
            if (this.state.datadetail.data.header) {
                income = (Decryptfun.decrypt(this.state.datadetail.data.header.sum_income));
                deduct = (Decryptfun.decrypt(this.state.datadetail.data.header.sum_deduct));
                let tincome = parseFloat(income.replace(',', '').replace(',', '').replace(',', ''));
                let tdeduct = parseFloat(deduct.replace(',', '').replace(',', '').replace(',', ''));

                netincome = parseInt((((parseFloat(tincome) * 100) - (parseFloat(tdeduct) * 100)))) / 100.0//(parseInt(parseFloat(tincome - tdeduct) * 100) / 100).toString();

                netincome = netincome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                taincome = netincome.split('.');

                if (taincome.length == 2) {
                    if (taincome[1].length == 1) {
                        netincomestr = taincome[0] + '.' + taincome[1] + '0'
                    } else {
                        netincomestr = taincome[0] + '.' + taincome[1]
                    }

                } else {
                    netincomestr = netincomestr = taincome[0] + '.00'
                }
                
                
                let datearr = this.state.datadetail.data.header.pay_date.split('-');
                pay_date_str = datearr[2] + ' ' + Months.monthNamesShort[parseInt(datearr[1]) - 1] + ' ' + datearr[0]
                if (this.state.datadetail.data.header.bank_name) {
                    bank_name_str = this.state.datadetail.data.header.bank_name;
                }
                if (this.state.datadetail.data.header.bank_acc_no) {
                    bank_acc_str = this.state.datadetail.data.header.bank_acc_no;
                }
                sum_income_str = Decryptfun.decrypt(this.state.datadetail.data.header.sum_income);
                sum_deduct_str = Decryptfun.decrypt(this.state.datadetail.data.header.sum_deduct);
                download = this.state.datadetail.data.download;
               
                if (bank_name_str.toLowerCase().split('commercial').length > 1) {
                    
                    bankicon = require('./../resource/images/bankIcon/scb.png')

                } else if (bank_name_str.toLowerCase().split('ayudhya').length > 1) {

                    bankicon = require('./../resource/images/bankIcon/bay.png')

                } else if (bank_name_str.toLowerCase().split('bangkok').length > 1) {

                    bankicon = require('./../resource/images/bankIcon/bbc.png')
                }

                let tdatearr = this.state.datadetail.data.header.pay_date.split('-');
       
            }
            

        }
        let yearstr = this.state.initialyear - this.state.yearselected

        if (this.state.yearlist) {

            date_text = this.state.yearlist[this.state.selectedindex].monthfull + ' ' + this.state.yearlist[this.state.selectedindex].year//Months.monthNames[this.state.monthselected] + ' ' + yearstr.toString()

        } else {

            let temp = this.state.datadetail.data.header.pay_date.split('-')

            date_text = Months.monthNames[parseInt(temp[1])-1] + ' ' + temp[0]

        }

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
                            <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Pay Detail</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                            <TouchableOpacity
                                disabled={!download}
                                // onPress={(this.onClickDownload.bind(this))}
                                onPress={() => { this.onClickDownload() }}
                            >
                                <Image
                                    style={ download ?
                                        { width: 50, height: 50, tintColor: 'white' } :
                                        { width: 50, height: 50, tintColor: Colors.navColor }}
                                    source={require('./../resource/images/PDFdownload.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                <View style={{ flex: 1, backgroundColor: Colors.backgroundColor, flexDirection: 'column', marginLeft: 15, marginRight: 15 }}>
                    <View style={{ flex: 0.7, flexDirection: 'column', justifyContent: 'center' }}>
                        <View style={{  flexDirection: 'row', justifyContent: 'center' }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {this.previousbuttonrender()}
                            </View>

                            <View style={{ flex: 8, justifyContent: 'center', alignItems: 'center' }}>

                                <Text style={{ fontSize: 21, color: Colors.redTextColor, textAlign: 'center', }}allowFontScaling={SharedPreference.allowfontscale}>

                                    {date_text}

                                </Text>

                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {this.nextmonthbuttonrender()}
                            </View>
                            <View style={{ flex: 6 }}></View>
                        </View>
                    </View>

                    <View style={{ flex: 0.5, justifyContent: 'center', }}>
                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>
                                (Paydate : {pay_date_str})
                            </Text>
                        </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Image
                                style={{ width: 45, height: 45 }}
                                source={bankicon}
                                resizeMode='contain'
                            />
                        </View>
                        <View style={{ flex: 5, flexDirection: 'column', justifyContent: 'center' }}>
                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>
                                {bank_name_str}
                            </Text>
                            <Text style={styles.payslipDetailTextLeft}allowFontScaling={SharedPreference.allowfontscale}>
                                Account no : {bank_acc_str}
                            </Text>
                        </View>


                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, marginTop: 5, marginBottom: 5, borderRadius: 5, backgroundColor: Colors.midnightblue, flexDirection: 'row', }}>

                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 * scale }}>
                                <Text style={styles.payslipTextLeft}allowFontScaling={SharedPreference.allowfontscale}>NET INCOME</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', marginRight: 10 * scale }}>
                                <Text style={styles.payslipTextRight}allowFontScaling={SharedPreference.allowfontscale}>
                                    {netincomestr}
                                </Text>
                            </View>

                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, marginTop: 5, marginRight: 5, borderRadius: 5, backgroundColor: this.state.incomeBG, flexDirection: 'column', }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowIncomeView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  }}>

                                    <Text style={this.state.showincome ? styles.payslipTextCente_income_ena : styles.payslipTextCente_income_dis}allowFontScaling={SharedPreference.allowfontscale}>INCOME</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.incomeBG  }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_income_ena : styles.payslipTextCente_income_dis}allowFontScaling={SharedPreference.allowfontscale}>
                                        {sum_income_str}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginTop: 5, marginLeft: 5, borderRadius: 5, backgroundColor: this.state.deductBG, flexDirection: 'column', }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowDeductView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_deduct_dis : styles.payslipTextCente_deduct_ena}allowFontScaling={SharedPreference.allowfontscale}>DEDUCT</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:this.state.deductBG  }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_deduct_dis : styles.payslipTextCente_deduct_ena}allowFontScaling={SharedPreference.allowfontscale}>
                                        {sum_deduct_str}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                    {this.renderdetail()}

                </View >
                {this.renderloadingscreen()}
            </View >
        );
    }
}