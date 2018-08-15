import React, { Component } from "react";
import { View, Image, Text, TextInput, Keyboard, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from './../SharedObject/Colors';
import RegisterAPI from './../constants/RegisterAPI';
import SetPinAPI from './../constants/SetPinAPI';
import StringText from "../SharedObject/StringText";
import SavePIN from "./../constants/SavePIN"

import SaveProfile from "./../constants/SaveProfile"
import SharedPreference from "../SharedObject/SharedPreference";
import SaveTOKEN from "./../constants/SaveToken"

import LoginWithPinAPI from "./../constants/LoginWithPinAPI"
import RestAPI from "./../constants/RestAPI"
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';

export default class RegisterActivity extends Component {

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
            versionCode: "Version : " + SharedPreference.deviceInfo.buildNumber,
            datastatus:0,
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_REGISTER)

        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
    }

    onRegister = async () => {
        ////console.log("onRegister")
        Keyboard.dismiss()
        let data = await RegisterAPI(this.state.username, this.state.password)
        code = data[0]
        data = data[1]

        console.log("onRegister ==> ", data.code)
        this.setState({
            datastatus: data.code
        })
        // Alert.alert(
        //     SharedPreference.deviceInfo.deviceOSVersion,
        //     data.code.toString(),
        //     [
        //         {
        //             text: 'OK', onPress: () => {
        //                 console.log('OK Pressed')
        //             }
        //         }
        //     ],
        //     { cancelable: false }
        // )
        if (code.SUCCESS == data.code) {
            this.saveProfile.setProfile(data.data)
            SharedPreference.profileObject = await this.saveProfile.getProfile()
            await this.onLoadLoginWithPin("001000200")

        } else if (code.DOES_NOT_EXISTS == data.code) {
            Alert.alert(
                StringText.REGISTER_INVALID_TITLE,
                StringText.REGISTER_INVALID_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                            console.log('OK Pressed')
                        }
                    }
                ],
                { cancelable: false }
            )
        } else if (code.INVALID_USER_PASS == data.code) {
            // console.log("11 statusText ==> code ==> ", data.data.code)
            // console.log("11 statusText ==> detail ==> ", data.data.detail)
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

        } else if (code.NETWORK_ERROR == data.code) {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                            console.log('OK Pressed')
                        }
                    }
                ],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                // StringText.ALERT_PLEASE_FILL_TITLE,
                // StringText.ALERT_PLEASE_FILL_DESC,
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
    }

    onLoadLoginWithPin = async (PIN) => {
        ////console.log("login with pin ==> ", PIN)
        let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        console.log("onLoadLoginWithPin ==> ", data.code)
        if (code.SUCCESS == data.code) {
            this.setState({
                isLoading: false
            })
            SharedPreference.calendarAutoSync = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
            await this.onLoadInitialMaster()
        } else if (code.INVALID_USER_PASS == data.code) {

            if (data.data.code == "MSC29132AERR") {
                Alert.alert(
                    StringText.ALERT_PIN_CANNOT_FIND_TITLE,
                    StringText.ALERT_PIN_CANNOT_FIND_DESC,
                    [
                        {
                            text: 'OK', onPress: () => {
                                SharedPreference.profileObject = null
                                this.saveProfile.setProfile(null)
                                this.props.navigation.navigate('RegisterScreen')
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
                                SharedPreference.profileObject = null
                                this.saveProfile.setProfile(null)
                                this.props.navigation.navigate('RegisterScreen')
                            }
                        }
                    ],
                    { cancelable: false }
                )

            }

        } else if (code.INVALID_AUTH_TOKEN == data.code) {
            Alert.alert(
                StringText.INVALID_AUTH_TOKEN_TITLE,
                StringText.INVALID_AUTH_TOKEN_DESC,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                    }
                }
                ],
                { cancelable: false })
        } else if ((code.INTERNAL_SERVER_ERROR == data.code) || (code.ERROR == data.code)) {
            Alert.alert(
                StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
                StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                    }
                }
                ],
                { cancelable: false })

        } else if (code.NETWORK_ERROR == data.code) {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                    }
                }
                ],
                { cancelable: false })
        } else {
            if (this.state.failPin == 4) {
                this.setState({
                    isLoading: false
                })
                Alert.alert(
                    StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                    StringText.ALERT_PIN_DESC_TOO_MANY_NOT_CORRECT,
                    [{
                        text: 'OK', onPress: () => {
                            SharedPreference.profileObject = null
                            this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                        }
                    }],
                    { cancelable: false }
                )
            } else {
                this.setState({
                    isLoading: false
                })
                Alert.alert(
                    StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                    StringText.ALERT_PIN_DESC_NOT_CORRECT,
                    [{
                        text: 'OK', onPress: () => {
                            let origin = this.state.failPin + 1
                            this.setState({
                                failPin: origin,
                                pin: ''
                            })
                        }
                    },
                    ],
                    { cancelable: false }
                )
            }
        }
    }


    onLoadLoginWithPin = async (PIN) => {

        let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        if (code.DUPLICATE_DATA == data.code) {//409
            this.onOpenPinActivity()
        } else if (code.INVALID_USER_PASS == data.code) {//401

            if (data.data.code == "MSC29132AERR") {
                this.setState({
                    showCreatePin: true
                })
            }

        } else {//500 
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

    onSetPin = async () => {

        let data = await SetPinAPI(this.state.pin2, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        // TODO 
        if (code.SUCCESS == data.code) {
            // await this.savePIN.setPin(this.state.pin2)
            this.setState({
                showCreatePinSuccess: true,
                showCreatePin: false
            })

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

    onLoadInitialMaster = async () => {
        //////console.log("InitialMaster ")
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
    async componentDidMount() {
        const enabled = await firebase.messaging().hasPermission();

        if (enabled) {
          ////console.log("firebase ==> user has permissions")
        } else {
          try {
            await firebase.messaging().requestPermission();
            ////console.log("firebase ==> User has authorised")
          } catch (error) {
            
          }
        }
    
        //////////Device Info/////////////
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        const deviceOS = DeviceInfo.getSystemName();
        const deviceOSVersion = DeviceInfo.getSystemVersion();
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();
    
        await firebase.messaging().getToken()
          .then((token) => {
            console.log('Register ==> firebase ==> message Device FCM Token: ', token);
            SharedPreference.deviceInfo = {
              "deviceModel": deviceModel,
              "deviceBrand": deviceBrand,
              "deviceOS": deviceOS,
              "deviceOSVersion": deviceOSVersion,
              "firebaseToken": token,
              "appVersion": appVersion,
              "buildNumber": buildNumber
            }
          });

        this.setState({
            versionCode: "Version : " + SharedPreference.deviceInfo.buildNumber
        })
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
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
        let origin = this.state.pin

        if (num == "-") {
            origin = origin.slice(0, -1);
        } else {
            origin = origin + num
        }

        // //////console.log("origin origin origin : ", origin)

        this.setState({
            pin: origin
        })
        this.state.pin = origin
        console.log("pin ====> ", this.state.pin)
        console.log("pin length ====> ", this.state.pin.length)

        if (this.state.pin.length == 6) {
            if (this.state.pin1.length == 0) {
                this.setState({
                    isLoading: true
                })
                // this.timer = setTimeout(() => {
                    this.setState({
                        pin: [],
                        pin1: origin,
                        pintitle: 'Confirm Pin',
                        isLoading: false
                    })
                    this.state.pin = []
                    this.state.pin1 = origin
                    this.state.pintitle = 'Confirm Pin'
                    this.state.isLoading = false
                // }, 1000);
            } else {
                this.setState({
                    isLoading: true
                })
                this.timer = setTimeout(() => {
                    this.setState({
                        pin: [],
                        pin2: origin,
                    })
                    this.state.pin = []
                    this.state.pin2 = origin
                    if (this.state.pin1 == this.state.pin2) {
                        //////console.log("========> pin ===> same ")
                        this.onSetPin()
                    } else {
                        //////console.log("========> pin ===> not same ")
                        //TODO Alert
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

                }, 1000);
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
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.alertDialogContainer}>
                        <View style={styles.emptyDialogContainer}>
                            <View style={[styles.navContainer, { backgroundColor: 'white' }]}>
                                <TouchableOpacity style={styles.navLeftContainer} onPress={() => { this.onClosePIN() }} >
                                    <Image
                                        style={[styles.navBackButton, { tintColor: Colors.grayColor }]}
                                        source={require('../resource/images/Back.png')}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.pinContainer, { backgroundColor: 'white' }]}>
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
                    </View>
                    {this.renderProgressView()}
                </View>)
        }
    }
    
    renderProgressView() {
        if (this.state.isLoading) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.alertDialogBackgroudAlpha} />
                    {/* bg */}
                    <View style={styles.alertDialogContainer}>
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
                                <Text style={styles.pinCreateSuccessDescText}>You've successfully changed your PIN.You can use</Text>
                                <Text style={styles.pinCreateSuccessDescText}>this new PIN to log in next time.</Text>
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

    render() {
        return (
            <View style={styles.container} >
                <View style={styles.container} >

                    {/* Image Background */}
                    <Image style={styles.registBackground}
                        source={require('../resource/regist/regist_white.png')} />

                    <View style={styles.registContainer}>
                        <Image source={require('../resource/regist/regist_logo.png')} />

                        <View style={[styles.registerContainerWidth, { marginBottom: this.state.keyboardHeight }]}>
                            <View style={styles.registTextContainer}>
                                <Image style={[styles.registetImageContainer, { height: 20, width: 20, }]}
                                    source={require('../resource/regist/regist_location.png')} />
                                <Text style={[styles.registText, { color: Colors.grayTextColor,marginTop:15 }]}>TDEM</Text>
                            </View>
                            <View style={styles.registLine} />

                            <View style={styles.registTextContainer}>
                                <Image style={[styles.registetImageContainer, { height: 20, width: 20, }]}

                                    source={require('../resource/regist/regist_user.png')} />
                                <TextInput
                                    onSubmitEditing={Keyboard.dismiss}
                                    autoCapitalize = 'none'
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
                                    autoCapitalize = 'none'
                                    underlineColorAndroid="transparent"
                                    secureTextEntry={true}
                                    selectionColor='black'
                                    style={styles.registText}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.lightGrayTextColor}
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
                        <Text style={{ color: 'lightgray' }}>{this.state.datastatus}</Text>
                        <Text style={{  color: 'lightgray' }}></Text>
                                <Text style={{ fontSize:10, color: 'lightgray' }}>{SharedPreference.deviceInfo.deviceBrand},{SharedPreference.deviceInfo.deviceOS},{SharedPreference.deviceInfo.deviceModel},{SharedPreference.deviceInfo.deviceOSVersion},{SharedPreference.deviceInfo.appVersion}</Text>
                                <Text style={{ fontSize:10, color: 'lightgray' }}>{SharedPreference.deviceInfo.firebaseToken}</Text>
                        
                       
                        
                    </View>
                </View >

                {this.renderCreatePin()}
                {this.renderCreatePinSuccess()}
            </View >
        );
    }

}

