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
    BackHandler
} from 'react-native';

import Colors from "../SharedObject/Colors"
import Layout from "../SharedObject/Layout"
import { styles } from "../SharedObject/MainStyles"
// import AnnounceTable from "../../components/TableviewCell"
import SharedPreference from "../SharedObject/SharedPreference"
import Decryptfun from "../SharedObject/Decryptfun"
import Months from "../constants/Month"

let currentmonth = new Date().getMonth();
let scale = Layout.window.width / 320;

import Authorization from '../SharedObject/Authorization'
import StringText from '../SharedObject/StringText';
import firebase from 'react-native-firebase';

export default class PayslipDetail extends Component {

    constructor(props) {

        super(props);
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
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_PAYSLIP_DETAIL)
        console.log('yearlist => ',this.state.yearlist) 
        console.log('datadetail => ',this.state.datadetail) 
        console.log('roll ID => ',this.state.yearlist[this.state.selectedindex]) 
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    }
 
    componentWillUnmount() {
       
        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
 
    handleBackButtonClick() {
        this.onBack()
        return true;
    }


    onBack() {
        SharedPreference.notipayslipID = 0

        if (this.state.yearlist) {

            this.props.navigation.navigate('PayslipList');

        } else {

            this.props.navigation.navigate('HomeScreen');
        }

    }

    onDownloadPDFFile = async () => {

        this.setState({

            isscreenloading: true,
       
            // dataSource: responseJson.results,
            // datadetail: PayslipDataDetail.detail[this.state.Monthlist[this.state.monthselected].id]

        }, function () {

            // //console.log('data response : ', this.state.datadetail.data.detail.deduct);
            //console.log('data detail :', responseJson)

            this.setState(this.renderloadingscreen())
        });

        PAYSLIP_DOWNLOAD_API = SharedPreference.PAYSLIP_DOWNLOAD_API + this.state.rollid
        pdfPath = PAYSLIP_DOWNLOAD_API


        yearSelect = this.state.initialyear - this.state.yearselected

        filename = "Payslip_" + this.state.yearArray[this.state.monthselected] + "_" + yearSelect + '.pdf'
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)
        // //console.log("calendarPDFAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)

        if (Platform.OS === 'android') {
            RNFetchBlob
                .config({
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: false,
                        path: RNFetchBlob.fs.dirs.DownloadDir + '/' + filename,
                        mime: 'application/pdf',
                        title: filename,
                        description: 'shippingForm'
                    }
                })
                .fetch('GET', pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                    ////console.log("Android ==> LoadPDFFile ==> Load Success  : ", resp);
                    RNFetchBlob.android.actionViewIntent(resp.data, 'application/pdf')
                })
                .catch((errorCode, errorMessage) => {
                    ////console.log("Android ==> LoadPDFFile ==> Load errorCode  : ", errorCode);
                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [

                            {
                                text: 'OK', onPress: () => {
                                    // this.addEventOnCalendar()
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                })
        } else {//iOS
            ////console.log("loadPdf pdfPath : ", pdfPath)
            ////console.log("loadPdf filename : ", filename)
            RNFetchBlob
                .config({
                    fileCache: true,
                    appendExt: 'pdf',
                    filename: filename
                })
                .fetch('GET', pdfPath, {
                    'Content-Type': 'application/pdf;base64',
                    Authorization: FUNCTION_TOKEN
                })
                .then((resp) => {
                    ////console.log("WorkingCalendarYear pdf1 : ", resp);
                    ////console.log("WorkingCalendarYear pdf2 : ", resp.path());
                    RNFetchBlob.fs.exists(resp.path())
                        .then((exist) => {
                            ////console.log(`WorkingCalendarYear ==> file ${exist ? '' : 'not'} exists`)
                        })
                        .catch(() => {
                            ////console.log('WorkingCalendarYear ==> err while checking')
                        });

                    RNFetchBlob.ios.openDocument(resp.path());
                    this.setState({

                        isscreenloading: false,
                   
                    }, function () {
                        this.setState(this.renderloadingscreen())
                    });

                })

               
                .catch((errorMessage, statusCode) => {
                    Alert.alert(
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_TITLE,
                        StringText.ALERT_PAYSLIP_CANNOT_DOWNLOAD_DESC,
                        [
                            {
                                text: 'OK', onPress: () => {
                                    // this.addEventOnCalendar()
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                });
        }
    }

    requestPDFPermission = async () => {
        //console.log("requestPDFPermission")
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    'title': "Permission",
                    'message': 'External Storage Permission'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //console.log("You can use the WRITE_EXTERNAL_STORAGE")

                this.setState({
                    havePermission: true
                })
                this.onDownloadPDFFile()
            } else {
                //console.log("WRITE_EXTERNAL_STORAGE permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }

    getPayslipDetailfromAPI = async () => {

        console.log()

        // this.state.rollid = 0

        // for (let i = 0; i < this.state.yearlist[this.state.yearselected].monthlistdata.length; i++) {

        //     //console.log(' loop  rollid :', this.state.yearlist[this.state.yearselected].monthlistdata[i].id)

        //     if (this.state.yearlist[this.state.yearselected].monthlistdata[i].month === this.state.monthselected + 1) {

        //         this.state.rollid = this.state.yearlist[this.state.yearselected].monthlistdata[i].id
        //     }
        // }
        //console.log('rollid :', this.state.rollid)

        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_PAYSLIP, SharedPreference.profileObject.client_token)
        //console.log("calendarPDFAPI ==> FUNCTION_TOKEN  : ", FUNCTION_TOKEN)


        if (this.state.rollid) {

            let host = SharedPreference.PAYSLIP_DETAIL_API + this.state.yearlist[this.state.selectedindex].rollID
            console.log('host :', host)
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
                        datadetail: responseJson
                        // dataSource: responseJson.results,
                        // datadetail: PayslipDataDetail.detail[this.state.Monthlist[this.state.monthselected].id]

                    }, function () {

                        // //console.log('data response : ', this.state.datadetail.data.detail.deduct);
                        //console.log('data detail :', responseJson)

                        this.setState(this.renderloadingscreen())
                    }

                    );

                })
                .catch((error) => {
                    console.error(error);
                });
        } else {

            this.setState({

                isscreenloading: false,
                datadetail: '',
                // dataSource: responseJson.results,
                // datadetail: PayslipDataDetail.detail[this.state.Monthlist[this.state.monthselected].id]

            }, function () {

                // //console.log('data response : ', this.state.datadetail.data.detail.deduct);
                // //console.log('data detail :', this.state.Monthlist[this.state.monthselected].id)

                this.setState(this.renderloadingscreen())
            }

            );


        }
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

        this.setState({
            //monthselected: this.state.monthselected + 1,
            selectedindex:this.state.selectedindex + 1

        }, function () {

            // if (this.state.monthselected > 11) {
            //     this.state.monthselected = 0;
            //     this.state.yearselected -= 1;
            // }

            //console.log('nextmonth monthselected : ', this.state.monthselected);

            this.onChangeMonth()
        });

    }

    previousmonth() {

        this.setState({
          //  monthselected: this.state.monthselected - 1,
selectedindex:this.state.selectedindex - 1
        }, function () {


            // if (this.state.monthselected < 0) {
            //     this.state.monthselected = 11;
            //     this.state.yearselected += 1;
            // }

            //console.log('monthselected : ', this.state.monthselected);
            //console.log('yearselected : ', this.state.yearselected);

            this.onChangeMonth()
        });

    }

    onChangeMonth() {

        this.setState({

            isscreenloading: true,
            loadingtype: 3

        }, function () {

            this.setState(this.renderloadingscreen())

            this.getPayslipDetailfromAPI()

        });

        // this.props.navigation.navigate('PaySlipDetail');

    }
    nextmonthbuttonrender() {

       // if (!this.state.yearlist) {
        if (this.state.yearlist.length <= this.state.selectedindex) {
            return (
                <View style={{ flex: 1 }}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/next_dis.png')}
                        resizeMode='contain'
                    />
                </View>
            )

        } else if (this.state.yearselected === 0 && this.state.monthselected === currentmonth) {
            return (
                <View style={{ flex: 1 }}>
                    <Image
                        style={{ width: 45, height: 45 }}
                        source={require('./../resource/images/next_dis.png')}
                        resizeMode='contain'
                    />
                </View>
            )
        }
        return (
            <View style={{ flex: 1 }}>
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

    previoousbuttonrender() {

        if (0 == this.state.selectedindex){
            
            return (

                <Image
                    style={{ width: 45, height: 45 }}
                    source={require('./../resource/images/previous_dis.png')}

                />

            )

         } 
        //else if (this.state.yearselected === 2 && this.state.monthselected === 0) {
        //     return (
        //         // <TouchableOpacity style={{ flex: 1 }}>y

        //         <Image
        //             style={{ width: 45, height: 45 }}
        //             source={require('./../resource/images/previous_dis.png')}
        //         // resizeMode='center'
        //         />
        //         // </TouchableOpacity>
        //     )
        // }
        return (
            <View style={{ flex: 1 }}>
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
                        <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                            <View style={{ height: 50, justifyContent: 'center' }}>
                                <Text style={styles.payslipTitleTextLeft}>INCOME</Text>
                            </View>
                            {this.renderdeatilincome()}
                        </View>
                    </View>

                )

            }
            return (
                <View style={{ flex: 5, }}>
                    <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                        {<View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.payslipTitleTextLeft}>DEDUCT</Text>
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
                                <Text style={styles.payslipDetailTextLeft}>INCOME</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                                <Text style={styles.payslipDetailTextCenter}>No Result</Text>
                            </View>
                        </View>
                    </View>

                )

            }
            return (
                <View style={{ flex: 5, }}>
                    <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>

                        {<View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.payslipDetailTextLeft}>DEDUCT</Text>
                        </View>}
                        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                            <Text style={styles.payslipDetailTextCenter}>No Result</Text>
                        </View>
                    </View>
                </View>

            )
        }

        // <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center',marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1 }}>
        // <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>
        //     <Text style={styles.payslipDetailTextCenter}>No Result</Text>
        //     </View>
        // </View>
        // );

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
                                        <View style={{ flex: 1, justifyContent: 'center', }}>
                                            <Text style={styles.payslipDetailTextLeft}>
                                                {item.key}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center', }}>
                                            <Text style={styles.payslipDetailTextRight}>
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
                <Text style={styles.payslipDetailTextCenter}>No Result</Text>
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
                                        <View style={{ flex: 1, justifyContent: 'center', }}>
                                            <Text style={styles.payslipDetailTextLeft}> {item.key}</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center', }}>
                                            <Text style={styles.payslipDetailTextRight}>
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
                <Text style={styles.payslipDetailTextCenter}>No Result</Text>
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
        let date_text = ''
        if (this.state.datadetail.data) {
            if(this.state.datadetail.data.header){
                income = (Decryptfun.decrypt(this.state.datadetail.data.header.sum_income));
                deduct = (Decryptfun.decrypt(this.state.datadetail.data.header.sum_deduct));
                let tincome = parseFloat(income.replace(',', ''));
                let tdeduct = parseFloat(deduct.replace(',', ''));
                netincome = tincome - tdeduct;
                let datearr = this.state.datadetail.data.header.pay_date.split('-');
                pay_date_str = datearr[2] + ' ' + Months.monthNamesShort[parseInt(datearr[1]) - 1] + ' ' + datearr[0]
                bank_name_str = this.state.datadetail.data.header.bank_name;
                bank_acc_str = this.state.datadetail.data.header.bank_acc_no;
                sum_income_str = Decryptfun.decrypt(this.state.datadetail.data.header.sum_income);
                sum_deduct_str = Decryptfun.decrypt(this.state.datadetail.data.header.sum_deduct);

                if (bank_name_str === 'The Siam Commercial Bank Public Company Limited') {
                    bankicon = require('./../resource/images/bankIcon/scb.png')
                } else if (bank_name_str === 'BANK OF AYUDHYA PUBLIC COMPANY LIMITED') {
                    bankicon = require('./../resource/images/bankIcon/bay.png')
                } else if (bank_name_str === 'BANK OF AYUDHYA PUBLIC COMPANY LIMITED (BAY)') {
                    bankicon = require('./../resource/images/bankIcon/bay.png')
                } else if (bank_name_str === 'Bangkok Bank Public Company Limited') {
                    bankicon = require('./../resource/images/bankIcon/bbc.png')
                }

                let tdatearr = this.state.datadetail.data.header.pay_date.split('-');
                date_text = Months.monthNames[this.state.monthselected] + ' ' + tdatearr[0]
            }
            

        }
        let yearstr = this.state.initialyear - this.state.yearselected
        date_text = this.state.yearlist[this.state.selectedindex].month +'-'+ this.state.yearlist[this.state.selectedindex].year//Months.monthNames[this.state.monthselected] + ' ' + yearstr.toString()

        if (!this.state.yearlist) {

            //console.log('pay_date_str : ',pay_date_str)

            let temp = pay_date_str.split(' ')

            date_text = temp[1] + ' ' + temp[2]

        }

        return (
            <View style={{ flex: 1 }} >

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
                            <Text style={styles.navTitleTextTop}>Pay Detail</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                            <TouchableOpacity 
                            disabled = {!this.state.datadetail.data}
                            onPress={(this.onDownloadPDFFile.bind(this))}
                            >
                                <Image
                                    style={this.state.datadetail.data ?
                                        { width: 50, height: 50, tintColor: 'white' } :
                                        { width: 50, height: 50, tintColor: 'red' }}
                                    source={require('./../resource/images/PDFdownload.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                <View style={{ flex: 1, backgroundColor: Colors.backgroundColor, flexDirection: 'column', marginLeft: 15, marginRight: 15 }}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {this.previoousbuttonrender()}
                            </View>

                            <View style={{ flex: 7, justifyContent: 'center', alignItems: 'center' }}>

                                <Text style={{ fontSize: 21, color: Colors.redTextColor, textAlign: 'center', }}>

                                    {date_text}

                                </Text>

                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {this.nextmonthbuttonrender()}
                            </View>
                            <View style={{ flex: 6 }}></View>
                        </View>
                        <View style={{ flex: 1, }}>
                            <Text style={styles.payslipDetailTextLeft}>
                                (Paydate : {pay_date_str})
                            </Text>
                        </View>

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
                            <Text style={styles.payslipDetailTextLeft}>
                                {bank_name_str}
                            </Text>
                            <Text style={styles.payslipDetailTextLeft}>
                                Account no : {bank_acc_str}
                            </Text>
                        </View>


                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, marginTop: 5, marginBottom: 5, borderRadius: 5, backgroundColor: Colors.midnightblue, flexDirection: 'row', }}>

                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 20 }}>
                                <Text style={styles.payslipTextLeft}>NET INCOME</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', marginRight: 20 }}>
                                <Text style={styles.payslipTextRight}>
                                    {netincome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </Text>
                            </View>

                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, marginTop: 5, marginRight: 5, borderRadius: 5, backgroundColor: this.state.incomeBG, flexDirection: 'column', }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowIncomeView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>

                                    <Text style={this.state.showincome ? styles.payslipTextCente_income_ena : styles.payslipTextCente_income_dis}>INCOME</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_income_ena : styles.payslipTextCente_income_dis}>
                                        {sum_income_str}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginTop: 5, marginLeft: 5, borderRadius: 5, backgroundColor: this.state.deductBG, flexDirection: 'column', }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowDeductView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 * scale }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_deduct_dis : styles.payslipTextCente_deduct_ena}>DEDUCT</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 * scale }}>
                                    <Text style={this.state.showincome ? styles.payslipTextCente_deduct_dis : styles.payslipTextCente_deduct_ena}>
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