import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import Authorization from '../SharedObject/Authorization'

import {
    Text,
    View,
    TouchableOpacity,
    Image, WebView,
    BackHandler,
    Platform,
    Alert,
    PanResponder,
    ScrollView
} from 'react-native';

import moment from 'moment'
import firebase from 'react-native-firebase';

import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText'
import Colors from "../SharedObject/Colors"
import Months from "./../constants/Month"
import { styles } from "./../SharedObject/MainStyles"

import RestAPI from "../constants/RestAPI"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import { DocumentDirectoryPath } from 'react-native-fs';

let content;
let title;
let category;
let modifly;
let createby;

let filelist;
let isPDF;
let notifacationID;

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
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_ANNOUCEMENT_DETAIL)
    }

    checkDataFormat(DataResponse) {
       
        if (DataResponse) {
            title = DataResponse.title
            content = DataResponse.content
            category=DataResponse.category
            modifly=DataResponse.attributes.create_date
            createby=DataResponse.attributes.create_by
            isPDF = true;
            filelist = DataResponse.fileInfo
            notifacationID = DataResponse.notifacationID
        }
       
    }

    componentDidMount() {
       
        // this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    // componentWillMount() {
    //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    // }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
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
        
        if (!SharedPreference.lastdatetimeinterval) {
            let today = new Date()
            const _format = 'YYYY-MM-DD hh:mm:ss'
            const newdate = moment(today).format(_format).valueOf();
            SharedPreference.lastdatetimeinterval = newdate
        }

       // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
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
            
        }else{

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
                    SharedPreference.notiAnnounceMentBadge = 0;
                    SharedPreference.notiPayslipBadge.length = [];
                    SharedPreference.nonPayslipBadge.length = [];
                    SharedPreference.Handbook = []
                    // SharedPreference.profileObject = null

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
                        isscreenloading: false
                    })
                    clearTimeout(this.timer);
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                   
                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog() {

        if (SharedPreference.userRegisted == true) {

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
                        // SharedPreference.profileObject = null
                        this.setState({
                            isscreenloading: false
                        })
                        this.props.navigation.navigate('RegisterScreen')
                        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER

                    }
                }],
                { cancelable: false }
            )

            SharedPreference.userRegisted = false;

        }

    }

    onBack() {
        
        SharedPreference.notiAnnounceMentID = 0
        // this.props.navigation.navigate('HomeScreen');
        this.props.navigation.goBack()
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    renderPDF(){
        if(filelist == null || filelist.length == 0){
            isPDF = false;
        }

        if(isPDF){
            var bodyArray = [];
            for (let i = 0; i < filelist.length; i++) {
                bodyArray.push(
                    <View style={styles.mainmenuImageButton} key={i}>
                    <TouchableOpacity onPress={() => { this.onClickDownload(filelist[i].fileNo , filelist[i].fileName) }}>
                        <Image
                            style={{ width: 50, height: 50 }}
                            source={require('./../resource/images/pdf-icon.png')}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, fontSize: 15,fontFamily: 'Prompt-Regular' }}
                            allowFontScaling={SharedPreference.allowfontscale}>{filelist[i].fileName}</Text>
                    </View>
                );
            }

            return(
                <View style={{ height: 80 }}>
                    <ScrollView horizontal={true}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                {bodyArray}
                            </View>
                    </ScrollView>
                    <View style={{ height: 1, marginLeft: 10, marginRight: 10, backgroundColor: Colors.grayColor }}></View>
                </View>
            );
        }
    }


    onClickDownload(fileno, filename){
        this.onDownloadPDFFile(fileno, filename);
    }

    onDownloadPDFFile = async (fileno, filename) => {

        ANNOUNCEMENT_DOWNLOAD_API = SharedPreference.ANNOUNCEMENT_DOWNLOAD_API + "?notiID=" +notifacationID +"&fileID=" + fileno
        FUNCTION_TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, SharedPreference.FUNCTIONID_ANNOUCEMENT, SharedPreference.profileObject.client_token)
        let savePath = DocumentDirectoryPath + '/pdf/' + filename;

        if (Platform.OS === 'android') {
            RNFetchBlob
                .config({
                    path: savePath,
                    title: filename,

                })
                .fetch('GET', ANNOUNCEMENT_DOWNLOAD_API, {
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
                .fetch('GET', ANNOUNCEMENT_DOWNLOAD_API, {
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

    render() {
        // content = `<span class="price bold some-class-name">$459.00</span>`;
        // console.log('modifly =>',content)
        let pp = modifly.split(' ');
        let tpp = pp[0].split('-');
        let spp = pp[1].split(':');
        var monthnow = new Date(tpp[0], parseInt(tpp[1])-1, tpp[2]);
        let modidtstr = Months.dayNames[parseInt(monthnow.getDay())] + ', ' + tpp[2] + ' ' + Months.monthNames[parseInt(tpp[1])-1] + ' ' + tpp[0] + ' at ' + spp[0] + ':' + spp[1]

        return (
            <View style={{ flex: 1 ,backgroundColor:'white'}}
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
                            <Text style={styles.navTitleTextTop} numberOfLines={1}allowFontScaling={SharedPreference.allowfontscale}>{title}</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                {/* <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                <ActivityIndicator />
            </View> */}
                <View style={{ flexDirection: 'column' }}>
                <View style={{ height: 4 }}></View>
                    <Text style={{ marginLeft: 20, fontSize: 15,fontFamily: 'Prompt-Regular', color: Colors.calendarRedText }}allowFontScaling={SharedPreference.allowfontscale}>{category}</Text>
                    <View style={{ height: 4 }}></View>
                    <Text style={{ marginLeft: 20, fontSize: 15,fontFamily: 'Prompt-Regular' }}allowFontScaling={SharedPreference.allowfontscale}>{title}</Text>
                    <View style={{ height: 20, flexDirection: 'row', alignContent: 'center' }}>
                        <View style={{ width: 15, height: 10, }} />
                        <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                style={{ width: 10, height: 10,tintColor: Colors.lightGrayTextColor }}
                                source={require('./../resource/images/clock.png')}
                                resizeMode='contain'
                            />
                        </View>
                        <Text style={{ height: 20, fontSize: 10,marginTop: 3, color: Colors.grayColor, fontFamily: 'Prompt-Regular' }}allowFontScaling={SharedPreference.allowfontscale}>{modidtstr}</Text>
                    </View>
                    <View style={{ height: 20, flexDirection: 'row', alignContent: 'center' }}>
                        <View style={{ width: 15, height: 10, }} />
                        <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                style={{ width: 10, height: 10,tintColor: Colors.lightGrayTextColor }}
                                source={require('./../resource/images/pen.png')}
                                resizeMode='contain'
                            />
                        </View>
                        <Text style={{ height: 20,fontSize: 10, marginTop: 5,color: Colors.grayColor, fontFamily: 'Prompt-Regular' }}allowFontScaling={SharedPreference.allowfontscale}>Create by : {createby}</Text>
                    </View>
                    <View style={{ height: 10 }}></View>
                    <View style={{ height: 1, marginLeft: 10, marginRight: 10, backgroundColor: Colors.grayColor }}></View>
                </View>

                {this.renderPDF()}
                <View style={{ flex: 1, marginTop: 0, marginRight: 10, marginLeft: 10 }}>
                    <WebView
                        source={{ html: '<!DOCTYPE html><html><body><style>{font-family:Prompt-Regular;}</style>' + content + '</body></html>' }}
                        // source={{ html: '<p><style><"font-size: 13px;">TST 01เทส th</p>' }}
                        // source={{ html: content }}
                        scalesPageToFit={(Platform.OS === 'ios') ? true : false}
                        automaticallyAdjustContentInsets={false}
                        // scalesPageToFit={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        decelerationRate="normal"
                        // scrollEnabled={true}
                    // style={{ flex: 1, marginTop: 0}}
                    />
                    {/* <WebView
                    // ref={WEBVIEW_REF}
                    automaticallyAdjustContentInsets={false}
                    source={{html:  content}}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    // startInLoadingState={true}
                    scalesPageToFit={false}
                  /> */}
                </View >
               
                
            </View >

        );
    }
}