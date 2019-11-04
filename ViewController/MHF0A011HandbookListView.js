import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image, Picker, WebView,
    FlatList,
    Platform,
    BackHandler,
    Alert,
    PanResponder
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"
import Authorization from "./../SharedObject/Authorization";
import inappdata from "./../InAppData/HandbookListData"
import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText';
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import HandBookCover from "./BookCover";

let dataSource = [];
let temphandbookData = [];
let FUNCTION_TOKEN;


export default class HandbookActivity extends Component {
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
            temparray: [],
        };
        temphandbookData = [];
        this.updateToken()
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));

        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_HANDBOOK_LIST)

    }

    componentDidMount() {

        
        // this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({
            isscreenloading: false,
        })
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

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        
        code = data[0]
        data = data[1]

        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog(data)

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

    updateToken() {

        FUNCTION_TOKEN = Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)
        console.log('[Handbookctivity] FUNCTION_TOKEN :', FUNCTION_TOKEN)
    }

    checkDataFormat(DataResponse) {

        if (DataResponse) {

            console.log('Handbookctivity DataResponse :', DataResponse)
            // dataSource = DataResponse.data;
            dataSource = DataResponse;
            this.createShelfHandbook();
        }

    }


    onBack() {
        dataSource=[]
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    onDetail(i) {

        if (SharedPreference.isConnected) {

            this.props.navigation.navigate('HandbookDetail', {
                handbook_file: dataSource[i].handbook_file,
                handbook_title: dataSource[i].handbook_title,
                FUNCTION_TOKEN: FUNCTION_TOKEN,
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

    setrowstate() {

        this.setState({ leftside: false });
    }

    createShelfHandbook() {

        temphandbookData = [];

        dataSource.map((item, i) => {

            this.state.temparray.push(

                this.createcomponent(i)

            )

            if (i % 2) {

                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }} key={i}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            } else if (i === dataSource.length - 1) {

                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }} key={i + 100}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            }

        });
    }


    createcomponent(i) {
        console.log('handbook_cover',dataSource[i].handbook_cover.split('=')[1])
        return (
            <View style={styles.handbookItem} key={i}>
                <TouchableOpacity style={{ flex: 1 }}
              
                    onPress={() => { this.onDetail(i) }}>
                    <View style={{ flex: 5, }}>
                        <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center' }}>

                            <HandBookCover
                                // placeholderUrl={'https://facebook.github.io/react/logo-og.png'}
                                coverUrl={SharedPreference.HANDBOOK_DOWNLOAD + dataSource[i].handbook_cover}
                                bookName={dataSource[i].handbook_cover.split('=')[1]}
                            // bookName={new Date().getUTCMilliseconds()}
                            />

                        </View>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={styles.epubbookname}
                        numberOfLines={2}
                        allowFontScaling={SharedPreference.allowfontscale}>{dataSource[i].handbook_title}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    renderChefHandbook() {
console.log('temphandbookData :',temphandbookData.length)
        if (temphandbookData.length) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', }}>
                        {/* <View style={{ flex: 1 }}> </View> */}
                        <View style={{ flex: 10 }}>
                            <ScrollView>
                                {
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        {temphandbookData}
                                    </View>
                                }
                            </ScrollView>
                        </View>
                    </View>
                </View>
            );
        }
        return (
            <View style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>
                <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
            </View>
        );

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
                            <Text style={[styles.navTitleTextTop, { fontFamily: "Prompt-Regular" }]}allowFontScaling={SharedPreference.allowfontscale}>E-Book</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
               {this.renderChefHandbook()}
            </View >
        );
    }
}