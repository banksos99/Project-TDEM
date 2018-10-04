import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    Image, WebView,
    BackHandler,
    Platform,
    Alert
} from 'react-native';

import { styles } from "./../SharedObject/MainStyles"
import SharedPreference from "./../SharedObject/SharedPreference"
import firebase from 'react-native-firebase';
import RestAPI from "../constants/RestAPI"
import StringText from '../SharedObject/StringText'
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import Colors from "../SharedObject/Colors"
import moment from 'moment'
import Months from "./../constants/Month"
let content;
let title;
let category;
let modifly;
let createby;

export default class PaySlipActivity extends Component {

    constructor(props) {
        super(props);
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
        }
       
    }

    componentDidMount() {
        this.settimerInAppNoti()
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
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    render() {
        // content = `<span class="price bold some-class-name">$459.00</span>`;
        let pp = modifly.split(' ');
        let tpp = pp[0].split('-');
        let spp = pp[1].split(':');
        var monthnow = new Date(tpp[0], tpp[1], tpp[2]);
        let modidtstr = Months.dayNames[parseInt(monthnow.getDay())] + ', ' + tpp[2] + ' ' + Months.monthNames[parseInt(tpp[1])] + ' ' + tpp[0] + ' at ' + spp[0] + ':' + spp[1]

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
                            <Text style={styles.navTitleTextTop} numberOfLines={1}>{title}</Text>
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
                    <Text style={{ marginLeft: 20, fontSize: 15,fontFamily: 'Prompt-Regular', color: Colors.calendarRedText }}>{category}</Text>
                    <View style={{ height: 4 }}></View>
                    <Text style={{ marginLeft: 20, fontSize: 15,fontFamily: 'Prompt-Regular' }}>{title}</Text>
                    <View style={{ height: 20, flexDirection: 'row', alignContent: 'center' }}>
                        <View style={{ width: 15, height: 10, }} />
                        <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                style={{ width: 10, height: 10,tintColor: Colors.lightGrayTextColor }}
                                source={require('./../resource/images/clock.png')}
                                resizeMode='contain'
                            />
                        </View>
                        <Text style={{ height: 20, fontSize: 10,marginTop: 3, color: Colors.grayColor, fontFamily: 'Prompt-Regular' }}>{modidtstr}</Text>
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
                        <Text style={{ height: 20,fontSize: 10, marginTop: 5,color: Colors.grayColor, fontFamily: 'Prompt-Regular' }}>Create by : {createby}</Text>
                    </View>
                    <View style={{ height: 10 }}></View>
                    <View style={{ height: 1, marginLeft: 10, marginRight: 10, backgroundColor: Colors.grayColor }}></View>
                </View>
                <WebView
                    source={{ html: '<!DOCTYPE html><html><body><style>{font-family:Prompt-Regular;}</style>' + content + '</body></html>' }}
                    // scalesPageToFit={(Platform.OS === 'ios') ? false : true}
                    scalesPageToFit={true}
                    automaticallyAdjustContentInsets={true}
                    
                    style={{ flex:1,marginTop: 0 ,marginRight:10,marginLeft:10}}
                />
            </View >

        );
    }
}