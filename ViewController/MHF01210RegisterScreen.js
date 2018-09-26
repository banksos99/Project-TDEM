import React, { Component } from "react";
import { View, Image, Text, TextInput, Keyboard, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from './../SharedObject/Colors';
import RegisterAPI from './../constants/RegisterAPI';
import SetPinAPI from './../constants/SetPinAPI';
import StringText from "../SharedObject/StringText";
import SavePIN from "./../constants/SavePIN"

import SaveProfile from "./../constants/SaveProfile"
import SharedPreference from "../SharedObject/SharedPreference";
import SaveTOKEN from "./../constants/SaveToken"

import LoginChangePinAPI from "./../constants/LoginChangePinAPI"

import RestAPI from "./../constants/RestAPI"
import firebase from 'react-native-firebase';
import Layout from "../SharedObject/Layout";

import SaveAutoSyncCalendar from "./../constants/SaveAutoSyncCalendar";
var BadgeAndroid = require('react-native-android-badge')

let scale = Layout.window.width / 320;
let countgettokenFB = 0;

export default class RegisterActivity extends Component {
    saveAutoSyncCalendar = new SaveAutoSyncCalendar()
    savePIN = new SavePIN()
    saveProfile = new SaveProfile()
    saveToken = new SaveTOKEN()

    constructor(props) {
        super(props);
        this.state = {
            keyboardHeight: 0,
            pin: [],
            pin1: [],
            pin2: [],
            showCreatePin: false,
            showCreatePinSuccess: false,
            pintitle: 'Create Pin',
            username: '',
            password: '',
            versionCode: "Version : " + SharedPreference.deviceInfo.appVersion,
            datastatus: 0,
            isLoading: false
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_REGISTER)

        // SharedPreference.sessionOpenFirstTime = true

    }

    async getfirebasetoken() {
        console.log('getfirebasetoken')
        if (!SharedPreference.deviceInfo.firebaseToken) {
            const fcmToken = await firebase.messaging().getToken();

            if (fcmToken) {
                // user has a device token
                SharedPreference.deviceInfo.firebaseToken = fcmToken
                countgettokenFB = 0;
                this.onRegister();

            } else {
                // user doesn't have a device token yet
                if (countgettokenFB < 3) {

                    countgettokenFB = countgettokenFB + 1
                    this.getfirebasetoken()

                } else {

                    countgettokenFB = 0
                    this.setState({
                        isLoading: false
                    })

                }

            }

        }

    }

    loginAuto() {

        this.onRegister();

    }

    onRegister = async () => {

        if (SharedPreference.isConnected) {
            // this.getfirebasetoken()
            this.setState({
                isLoading: true
            })
            Keyboard.dismiss()
            console.log('onRegister')
            let data = await RegisterAPI(this.state.username, this.state.password)
            code = data[0]
            data = data[1]
            console.log('onRegister', data)
            this.setState({
                datastatus: data.code
            })

            // let loginsuccess = false;
            // let autoregisterCount = 0;
            //  console.log('get token again',data.data.detail)
            if (code.SUCCESS == data.code) {
                this.saveAutoSyncCalendar.setAutoSyncCalendar(null)
                // SharedPreference.profileObject = data.data
                
                // this.saveProfile.setProfile(data.data)
                // SharedPreference.profileObject = await this.saveProfile.getProfile()
                
                SharedPreference.userRegisted = true;
                SharedPreference.lastdatetimeinterval = data.data.last_request

                loginsuccess = true;
                
                await this.onCheckPINWithChangePIN('1111', '2222')
                this.setState({
                    isLoading: false
                })

            } else if (code.DOES_NOT_EXISTS == data.code) {

                Alert.alert(
                    StringText.ALERT_SESSION_AUTHORIZED_TITILE,
                    StringText.ALERT_SESSION_AUTHORIZED_DESC,
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.setState({
                                    isLoading: false,
                                    password: ''
                                })
                            }
                        }
                    ],
                    { cancelable: false }
                )
            } else if (code.INVALID_USER_PASS == data.code) {

                Alert.alert(
                    data.data.code,
                    data.data.detail,
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.setState({
                                    isLoading: false,
                                    password: ''

                                })
                            }
                        }
                    ],
                    { cancelable: false }
                )


            } else if (code.FAILED == data.code) {

                if (data.data.detail === 'MHF00602AERR: Parameter firebase_tokens value are missing.') {
                    //get firebase token gain
                    console.log('get token again')
                    this.getfirebasetoken()

                } else {
                    Alert.alert(
                        data.data.code,
                        data.data.detail,
                        [
                            {
                                text: 'OK', onPress: () => {
                                    this.setState({
                                        isLoading: false
                                    })

                                }
                            }
                        ],
                        { cancelable: false }
                    )

                }

            } else if (code.NETWORK_ERROR == data.code) {
                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_SERVER_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_SERVER_DETAIL,
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.setState({
                                    isLoading: false
                                })
                            }
                        }
                    ],
                    { cancelable: false }
                )
            } else {
                Alert.alert(
                    data.data.code,
                    data.data.detail,
                    [
                        {
                            text: 'OK', onPress: () => {
                                console.log('OK Pressed')
                            }
                        }
                    ],
                    { cancelable: false }
                )
            }
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                            this.setState({
                                isLoading: false
                            })
                        }
                    }
                ],
                { cancelable: false }
            )


        }

    }
    componentDidMount() {

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


    }

    onCheckPINWithChangePIN = async (PIN1, PIN2) => {

        console.log("Tdem ==> onCheckPINWithChangePIN  ==> show")

        let data = await LoginChangePinAPI(PIN1, PIN2, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        // console.log("LoginChangePinAPI code ==> ", data.code)
        // console.log("LoginChangePinAPI data ==> ", data.data)

        if (code.DUPLICATE_DATA == data.code) {//409
            this.onOpenPinActivity()
            this.setState({
                isLoading: false
            })
        } else if (code.INVALID_DATA == data.code) {//401
            if (data.data.code == "MHF00301ACRI") {
                this.setState({
                    showCreatePin: true,
                    isLoading: false
                })
            }

        } else {//500 
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                        }
                    }
                ],
                { cancelable: false }
            )
        }
    }


    onSetPin = async () => {
        console.log('onSetPin')
        let data = await SetPinAPI(this.state.pin2, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        this.setState({
            isLoading: false
        })

        if (code.SUCCESS == data.code) {
            console.log("Tdem ==> onCheckPINWithChangePIN  ==> show")
            this.setState({
                showCreatePinSuccess: true,
                showCreatePin: false,

            })

        } else {
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
                [
                    {
                        text: 'OK', onPress: () => {

                        }
                    }
                ],
                { cancelable: false }
            )
        }
    }

    onLoadInitialMaster = async () => {
        console.log("InitialMaster ")
        console.log("profileObject ",SharedPreference.profileObject)
        let data = await RestAPI(SharedPreference.INITIAL_MASTER_API, SharedPreference.FUNCTIONID_GENERAL_INFORMATION_SHARING)
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {
            array = data.data
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element.master_key == 'NOTIFICATION_CATEGORY') {
                    SharedPreference.NOTIFICATION_CATEGORY = element.master_data
                } else if (element.master_key == 'READ_TYPE') {
                    SharedPreference.READ_TYPE = element.master_data
                } else if (element.master_key == 'COMPANY_LOCATION') {
                    SharedPreference.COMPANY_LOCATION = element.master_data
                    // for(){

                    // }
                } else {
                    SharedPreference.TB_M_LEAVETYPE = element.TB_M_LEAVETYPE
                }
            }

            //////console.log('onLoadAppInfo:')
            await this.onLoadAppInfo()

        } else {
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
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
    }

    onLoadAppInfo = async () => {

        let data = await RestAPI(SharedPreference.APPLICATION_INFO_API)
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {
            //////console.log('app info data2 :', data)
            // let appversion = '1.0.0'
            if (data.data.force_update === 'Y') {
                Alert.alert(
                    'New Version Available',
                    'This is a newer version available for download! Please update the app by visiting the Apple Store',
                    [

                        {
                            text: 'Update', onPress: () => {
                                //console.log('OK Pressed') },
                            }
                        }
                    ],
                    { cancelable: false }
                )

            }

        }
        this.props.navigation.navigate('HomeScreen')

    }

    onClosePIN = () => {
        this.setState({
            showCreatePin: false,
            pin: [],
            pin1: [],
            pin2: [],
        })
    }


    componentWillMount() {
        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow(e) {
        this.setState({
            keyboardHeight: e.endCoordinates.height
        })
    }

    _keyboardDidHide() {
        this.setState({
            keyboardHeight: 0
        })
    }

    setPIN(num) {
        console.log("function setPIN")
        let origin = this.state.pin

        if (num == "-") {
            origin = origin.slice(0, -1);
        } else {
            origin = origin + num
        }

        this.setState({
            pin: origin
        })
        this.state.pin = origin


        if (this.state.pin.length == 6) {
            console.log("this.state.pin.length", this.state.pin.length)
            console.log("this.state.pin1.length", this.state.pin1.length)
            if (this.state.pin1.length == 0) {
                this.setState({
                    pin1: origin,
                })

                this.timer = setTimeout(() => {
                    this.setState({
                        pin: [],
                        pintitle: 'Confirm Pin',
                    })
                }, 300);
            } else {
                this.setState({
                    isLoading: true
                })

                this.timer = setTimeout(() => {
                    this.setState({
                        pin: [],
                        pin2: origin,
                    })
                    // this.state.pin = []
                    // this.state.pin2 = origin
                    console.log("this.state.pin1", this.state.pin1)
                    console.log("this.state.pin2", this.state.pin2)
                    if (this.state.pin1 == this.state.pin2) {
                        console.log("on set pin again")
                        this.onSetPin()

                    } else {
                        Alert.alert(
                            StringText.REGISTER_PIN_ERROR_TITLE,
                            StringText.REGISTER_PIN_ERROR_DESC,
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.setState({
                                            pin: [],
                                            pin1: [],
                                            pin2: [],
                                            pintitle: 'Create Pin',
                                            isLoading: false
                                        })
                                    }
                                },
                            ],
                            { cancelable: false }
                        )
                    }

                }, 300);
            }
        }
    }

    onOpenPinActivity() {
        //////console.log("PinScreen")
        this.props.navigation.navigate('PinScreen')
    }

    onResetPin() {
        //////console.log("Reset Pin")
    }

    renderCreatePin() {
        if (this.state.showCreatePin == true) {
            console.log("Register ==> this.state.showCreatePin : ", this.state.showCreatePin)
            return (
                <View style={styles.alertDialogContainer}>
                    {/* <View style={styles.alertDialogContainer}> */}
                    {/* <View style={styles.emptyDialogContainer}> */}
                    {/* <View style={[styles.navContainer, { backgroundColor: 'white' }]}> */}
                    <View style={{ height: '50%', }}>
                        <View style={[styles.navContainer, { backgroundColor: 'white' }]}>
                            <TouchableOpacity style={styles.navLeftContainer} onPress={() => { this.onClosePIN() }} >
                                <Image
                                    style={[styles.navBackButton, { tintColor: Colors.grayColor }]}
                                    source={require('../resource/images/Back.png')}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.pinContainer, { backgroundColor: 'white', flex: 1 }]}>
                            <Image
                                style={styles.pinImage}
                                source={require('../resource/regist/regist_lock_gray.png')}
                                resizeMode="cover" />

                            <Text style={styles.pinText}>{this.state.pintitle}</Text>
                            {this.renderImagePin()}

                            <TouchableOpacity onPress={() => { this.onResetPin.bind(this) }}>
                                <Text style={styles.registPinForgotContainer}>Reset PIN ?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ height: '50%', width: '100%', backgroundColor: Colors.redColor }}>
                        {/* <View style={{ height: 300 * scale, width: '100%' }}> */}
                        <View style={styles.registPinNumRowContainer}>
                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(1) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>1</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(2) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>2</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(3) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>3</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.registPinNumRowContainer}>
                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(4) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>4</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(5) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>5</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(6) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>6</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.registPinNumRowContainer}>
                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(7) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>7</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(8) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>8</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(9) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>9</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.registPinNumRowContainer}>
                            <View style={styles.registPinNumContainer} />

                            <TouchableOpacity style={styles.emptyContainer}
                                onPress={() => { this.setPIN(0) }}>
                                <View style={styles.registPinNumContainer}>
                                    <Text style={styles.pinnumber}>0</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.registPinNumContainer}
                                onPress={() => { this.setPIN('-') }}>
                                <Image style={styles.pinDelete}
                                    source={require('../resource/images/pin_delete.png')}
                                    resizeMode="contain" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {this.renderProgressView()}
                </View>

                //     </View >
                // { this.renderProgressView() }
                // </View >

            )
        }
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

    renderCreatePinSuccess() {
        if (this.state.showCreatePinSuccess == true) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.emptyDialogContainer}>

                        <View style={[styles.registPinSuccessContainer]}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }} >
                                <Image style={{ width: 120, height: 120, marginBottom: 20 }}
                                    source={require('../resource/regist/regist_lock_green.png')}
                                    resizeMode="cover" />
                                <Text style={styles.pinCreateSuccessTitleText}>Create PIN Successfully</Text>
                                <Text style={styles.pinCreateSuccessDescText}>You've successfully created/changed your PIN.You can use</Text>
                                <Text style={styles.pinCreateSuccessDescText}>this PIN to log in next time.</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => { this.onOpenPinActivity() }}>
                            <View style={styles.pinButtonContainer}>
                                <Text style={styles.pinCreateSuccessButtonText}>DONE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View >)
        }

    }

    renderImagePin() {

        let but1 = require('../resource/circle.png')
        let but2 = require('../resource/circle.png')
        let but3 = require('../resource/circle.png')
        let but4 = require('../resource/circle.png')
        let but5 = require('../resource/circle.png')
        let but6 = require('../resource/circle.png')

        if (this.state.pin.length >= 1) { but1 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 2) { but2 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 3) { but3 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 4) { but4 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 5) { but5 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 6) { but6 = require('../resource/circleEnable.png') }


        return (<View style={styles.registPinImageContainer}>
            <Image style={styles.createPinImageSubContainer} source={but1} />
            <Image style={styles.createPinImageSubContainer} source={but2} />
            <Image style={styles.createPinImageSubContainer} source={but3} />
            <Image style={styles.createPinImageSubContainer} source={but4} />
            <Image style={styles.createPinImageSubContainer} source={but5} />
            <Image style={styles.createPinImageSubContainer} source={but6} />
        </View>)

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
            <View style={styles.container} >
                {/* <View style={styles.container} > */}

                {/* Image Background */}
                <Image style={styles.registBackground}
                    source={require('../resource/regist/regist_white.png')} />

                <View style={styles.registContainer}>
                    <Image source={require('../resource/regist/regist_logo.png')} />

                    <View style={[styles.registerContainerWidth, { marginBottom: this.state.keyboardHeight }]}>
                        <View style={styles.registTextContainer}>
                            <Image style={[styles.registetImageContainer, { height: 20, width: 20, }]}
                                source={require('../resource/regist/regist_location.png')} />
                            <Text style={[styles.registText, { color: Colors.grayTextColor, marginTop: 15 }]}>TDEM</Text>
                        </View>
                        <View style={styles.registLine} />

                        <View style={styles.registTextContainer}>
                            <Image style={[styles.registetImageContainer, { height: 20, width: 20 }]}

                                source={require('../resource/regist/regist_user.png')} />
                            <TextInput
                                onSubmitEditing={Keyboard.dismiss}
                                autoCapitalize='none'
                                underlineColorAndroid="transparent"
                                selectionColor='black'
                                style={styles.registText}
                                placeholder="User ID"
                                placeholderTextColor={Colors.lightGrayTextColor}
                                onChangeText={(username) => this.setState({ username })} />

                        </View>
                        <View style={styles.registLine} />

                        <View style={styles.registTextContainer}>
                            <Image style={[styles.registetImageContainer, { height: 20, width: 20, }]}
                                source={require('../resource/regist/regist_locked.png')} />
                            <TextInput

                                onSubmitEditing={Keyboard.dismiss}
                                autoCapitalize='none'
                                underlineColorAndroid="transparent"
                                secureTextEntry={true}
                                selectionColor='black'
                                style={styles.registText}
                                placeholder="Password"
                                placeholderTextColor={Colors.lightGrayTextColor}
                                value={this.state.password}
                                onChangeText={(password) => this.setState({ password })} />
                        </View>

                        <View style={styles.registLine} />
                        <TouchableOpacity
                            onPress={() => this.onRegister()}
                        >
                            <View style={styles.registButton}>
                                <Text style={styles.registTextButton}>
                                    Log In
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {/* Device Info */}
                    <Text></Text>
                    <Text>{this.state.versionCode}</Text>
                    {/* <Text style={{ color: 'lightgray' }}>{this.state.datastatus}</Text>
                        <Text style={{ fontSize: 10, color: 'lightgray' }}>{SharedPreference.deviceInfo.deviceBrand},{SharedPreference.deviceInfo.deviceOS},{SharedPreference.deviceInfo.deviceModel},{SharedPreference.deviceInfo.deviceOSVersion},{SharedPreference.deviceInfo.appVersion}</Text>
                        <Text style={{ fontSize: 10, color: 'lightgray' }}>{SharedPreference.deviceInfo.firebaseToken}</Text> */}
                </View>
                {/* </View > */}
                {this.renderCreatePin()}
                {this.renderCreatePinSuccess()}

                {this.renderProgressView()}

            </View >
        );
    }

}

